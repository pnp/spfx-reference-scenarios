import { Logger, LogLevel } from "@pnp/logging";
import "@pnp/graph/users";
import "@pnp/graph/onedrive";
import "@pnp/graph/groups";
import { graph, graphGet, GraphQueryable } from "@pnp/graph";

import { findIana } from 'windows-iana';

import { wc } from './wc.service';
import { IConfig, IPerson, Config, CONFIG_TYPE, Person, PERSON_TYPE, WCView, Team } from "../models/wc.models";
import { forEach, flatMap } from "lodash";
import { IANAZone, DateTime } from "luxon";

export interface IWorldClockMemberService {
  GenerateConfig: () => Promise<IConfig>;
  UpdateTimezones: (members: IPerson[]) => Promise<boolean>;
}

export class WorldClockMemberService implements IWorldClockMemberService {
  private LOG_SOURCE: string = "🔶WorldClockMemberService";

  constructor() {
  }

  public async GenerateConfig(): Promise<IConfig> {
    let wcConfig: IConfig = null;
    try {
      wcConfig = new Config(wc.ConfigType);
      if (wcConfig.configType === CONFIG_TYPE.Team) {
        wcConfig.configTeam = new Team(wc.GroupId, wc.TeamName);
        wcConfig.members = await this._getTeamMembers();
        if (wcConfig.members.length <= 20) {
          //Create Default View
          const view = new WCView("0", "Default", flatMap(wcConfig.members, (o) => { return o.personId; }));
          wcConfig.defaultViewId = "0";
          wcConfig.views.push(view);
        }
        this.UpdateTimezones(wcConfig.members);
      } else {
        const current = await graph.me.select("id,userPrincipalName,displayName,jobTitle,user").get<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string }>();
        wcConfig.configPerson = new Person(current.id, current.userPrincipalName, PERSON_TYPE.Employee, current.displayName, current.jobTitle, current.mail, "", wc.IANATimeZone);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GenerateConfig) - ${err} - `, LogLevel.Error);
    }
    return wcConfig;
  }

  private async _getTeamMembers(): Promise<IPerson[]> {
    let retVal: IPerson[] = [];
    try {
      if (wc.GroupId?.length > 0) {
        const members = await graphGet<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string, userType: string }[]>(
          GraphQueryable(graph.groups.getById(wc.GroupId).toUrl(), "members?$select=id,displayName,jobTitle,mail,userPrincipalName,userType")
        );
        if (members?.length > 0) {
          forEach(members, (o) => {
            const ext = (o.userType.toLowerCase() == "member") ? false : true;
            const currentZone = (o.userPrincipalName.toLowerCase() === wc.UserLogin.toLowerCase()) ? wc.IANATimeZone : null;
            const p = new Person(o.id, o.userPrincipalName, (ext) ? PERSON_TYPE.LocGuest : PERSON_TYPE.Employee, o.displayName, o.jobTitle, o.mail, null, currentZone);
            retVal.push(p);
          });
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTeamMembers) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async UpdateTimezones(members: IPerson[]): Promise<boolean> {
    let hasChanged: boolean = false;
    try {
      if (wc.GroupId?.length > 0) {
        const now = DateTime.utc().millisecond;
        for (let i = 0; i < members.length; i++) {
          const o = members[i];
          if (o.personType !== PERSON_TYPE.LocGuest) {
            //Check Windows Timezone
            try {
              const tz = await graphGet(GraphQueryable(graph.users.getById(o.personId).toUrl(), "mailboxSettings/timeZone"));
              //If changed convert to IANA
              if (o.windowsTimeZone != tz || o.IANATimeZone?.length < 1) {
                hasChanged = true;
                o.windowsTimeZone = tz;
                const winTZ = findIana(tz);
                if (winTZ) {
                  o.IANATimeZone = winTZ[0];
                  o.offset = IANAZone.create(o.IANATimeZone).offset(now);
                }
              }
            } catch (e) {
              //Some do not have mailbox setup.
            }

          }
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateTimezones) - ${err} - `, LogLevel.Error);
    }
    return hasChanged;
  }
}