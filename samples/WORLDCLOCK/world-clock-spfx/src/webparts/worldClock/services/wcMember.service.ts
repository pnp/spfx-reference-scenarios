import { Logger, LogLevel } from "@pnp/logging";
import "@pnp/graph/users";
import "@pnp/graph/onedrive";
import "@pnp/graph/groups";
import { graph, graphGet, GraphQueryable } from "@pnp/graph";

import findIndex from "lodash/findIndex";
import filter from "lodash/filter";
import flatMap from "lodash/flatMap";
import forEach from "lodash/forEach";

import { findIana } from 'windows-iana';

import { wc } from './wc.service';
import { IConfig, IPerson, Config, CONFIG_TYPE, Person, PERSON_TYPE, WCView, Team, ITimeZone, TimeZone } from "../models/wc.models";
import { IANAZone, DateTime } from "luxon";
import strings from "WorldClockWebPartStrings";

export interface IWorldClockMemberService {
  GenerateConfig: () => Promise<IConfig>;
  UpdateTimezones: (members: IPerson[]) => boolean;
  GetAvailableTimeZones: () => Promise<ITimeZone[]>;
  UpdateTeamMembers(members: IPerson[]): Promise<boolean>;
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
      } else {
        const current = await graph.me.select("id,userPrincipalName,displayName,jobTitle,user").get<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string }>();
        wcConfig.configPerson = new Person(current.id, current.userPrincipalName.toLowerCase(), PERSON_TYPE.Employee, current.displayName, current.jobTitle, current.mail, "", null, wc.IANATimeZone);
      }
      wcConfig.members = await this._getTeamMembers();
      if (wcConfig.configPerson != undefined) {
        wcConfig.members.unshift(wcConfig.configPerson);
      }
      if (wcConfig.members.length > 0 && wcConfig.members.length <= 20) {
        //Create Default View     
        const view = new WCView("0", strings.DefaultViewTitle, flatMap(wcConfig.members, (o) => { return o.personId; }));
        wcConfig.defaultViewId = "0";
        wcConfig.views.push(view);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GenerateConfig) - ${err} - `, LogLevel.Error);
    }
    return wcConfig;
  }

  private async _getTeamMembers(): Promise<IPerson[]> {
    let retVal: IPerson[] = [];
    try {
      let members: { id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string, userType: string }[] = null;
      if (wc.ConfigType === CONFIG_TYPE.Team && wc.GroupId?.length > 0) {
        members = await graphGet<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string, userType: string }[]>(
          GraphQueryable(graph.groups.getById(wc.GroupId).toUrl(), "members?$select=id,displayName,jobTitle,mail,userPrincipalName,userType")
        );
      } else if (wc.ConfigType === CONFIG_TYPE.Personal) {
        const people = await graph.me.people.top(20)
          .select("id,displayName,jobTitle,userPrincipalName,scoredEmailAddresses,personType")
          .get<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, scoredEmailAddresses: { address: string }[], personType: { class: string, subclass: string } }[]>();
        if (people.length > 0) {
          members = [];
          forEach(people, (o) => {
            const skip = (o.userPrincipalName == undefined) ? false : (o.userPrincipalName.toLowerCase() === wc.UserLogin.toLowerCase());
            if (!skip) {
              const memberIdx = findIndex(members, { id: o.id });
              if (memberIdx === -1) {
                members.push({ id: o.id, userPrincipalName: o.userPrincipalName, displayName: o.displayName, jobTitle: o.jobTitle, mail: o.scoredEmailAddresses[0].address, userType: (o.personType.subclass === 'OrganizationUser') ? "Member" : "Guest" });
              }
            }
          });
        }
      }
      if (members?.length > 0) {
        forEach(members, (o) => {
          const ext = (o.userType.toLowerCase() == "member") ? false : true;
          const currentZone = (o.userPrincipalName?.toLowerCase() === wc.UserLogin.toLowerCase()) ? wc.IANATimeZone : null;
          const p = new Person(o.id, o.userPrincipalName.toLowerCase(), (ext) ? PERSON_TYPE.LocGuest : PERSON_TYPE.Employee, o.displayName, o.jobTitle, o.mail, null, null, currentZone);
          retVal.push(p);
        });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTeamMembers) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public async UpdateTeamMembers(members: IPerson[]): Promise<boolean> {
    if (wc.ConfigType === CONFIG_TYPE.Personal) { return false; }
    let hasChanged: boolean = false;
    try {
      const currentTeamMembers = await this._getTeamMembers();
      //Missing Team Members
      forEach(currentTeamMembers, (o) => {
        const exists = findIndex(members, { personId: o.personId });
        if (exists === -1) {
          hasChanged = true;
          members.push(o);
        }
      });
      //Remove Deleted Members
      members = filter(members, (o) => {
        const exists = findIndex(currentTeamMembers, { personId: o.personId });
        if (exists === -1) { hasChanged = true; }
        return (exists > -1);
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateTeamMembers) - ${err} - `, LogLevel.Error);
    }
    return hasChanged;
  }

  public async GetAvailableTimeZones(): Promise<ITimeZone[]> {
    let retVal: ITimeZone[] = [];
    try {
      const timezones = await graphGet<{ alias: string, displayName: string }[]>(
        GraphQueryable(graph.me.toUrl(), "outlook/supportedTimeZones(TimeZoneStandard=microsoft.graph.timeZoneStandard'Iana')")
      );
      if (timezones?.length > 0) {
        forEach(timezones, (tz) => {
          const t = new TimeZone(tz.alias, tz.displayName);
          retVal.push(t);
        });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getAvailableTimeZones) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  public UpdateTimezones(members: IPerson[]): boolean {
    let hasChanged: boolean = false;
    try {
      const now = DateTime.utc().millisecond;
      for (let i = 0; i < members.length; i++) {
        const o = members[i];
        if (o.windowsTimeZone?.length > 0 || o.IANATimeZone?.length < 1) {
          const winTZ = findIana(o.windowsTimeZone);
          if (winTZ) {
            hasChanged = true;
            o.IANATimeZone = winTZ[0];
            o.offset = IANAZone.create(o.IANATimeZone).offset(now);
          }
        } else if (o.IANATimeZone?.length > 0) {
          const offset = IANAZone.create(o.IANATimeZone).offset(now);
          if (offset != o.offset) {
            hasChanged = true;
            o.offset = offset;
          }
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateTimezones) - ${err} - `, LogLevel.Error);
    }
    return hasChanged;
  }
}