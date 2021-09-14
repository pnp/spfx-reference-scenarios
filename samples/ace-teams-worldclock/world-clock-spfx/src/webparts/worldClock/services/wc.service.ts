import { Logger, LogLevel } from "@pnp/logging";
import { sp } from "@pnp/sp";
import { graph, graphGet, GraphQueryable, graphPut } from "@pnp/graph";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items/list";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/graph/users";
import "@pnp/graph/onedrive";
import "@pnp/graph/groups";

import { findIndex } from "@microsoft/sp-lodash-subset";
import filter from "lodash-es/filter";
import { sortBy } from "@microsoft/sp-lodash-subset";
import { find } from "@microsoft/sp-lodash-subset";
import forEach from "lodash-es/forEach";

import { DateTime, IANAZone } from "luxon";

import { IConfig, IPerson, CONFIG_TYPE, Person, PERSON_TYPE, ITimeZone, TimeZone } from "../models/wc.models";
import { WorldClockMemberService, IWorldClockMemberService } from "./wcMember.service";

export interface IWorldClockService {
  ConfigRefresh(value: () => void);
  Init(loginName: string, locale: string, siteUrl: string, groupId: string, teamName: string, configType: CONFIG_TYPE): Promise<void>;
  UpdateConfig(config?: IConfig, newFile?: boolean): Promise<boolean>;
  GetTeamMembers(members: string[]): IPerson[];
  RemoveTeamMember(member: IPerson): boolean;
  SearchMember(query: string): Promise<IPerson[]>;
  AddMember(newMember: IPerson): boolean;
  UpdateMember(member: IPerson): boolean;
}

export class WorldClockService implements IWorldClockService {
  private LOG_SOURCE: string = "🔶WorldClockService";
  private CONFIG_FOLDER: string = "WorldClockApp";
  private CONFIG_FILE_NAME: string = "worldclockconfig.json";

  private _wcm: IWorldClockMemberService = new WorldClockMemberService();
  private _ready: boolean = false;
  private _needsConfigRefresh: boolean = false;
  private _configRefresh: () => void;
  private _executeDeepLink: (meetingUrl: string) => void;
  private _configType: CONFIG_TYPE = CONFIG_TYPE.Team;
  private _userLogin: string = "";
  private _siteUrl: string = "";
  private _locale: string = "us";
  private _configItemId: string = "";
  private _groupId: string = "";
  private _teamName: string = "";
  private _currentIANATimeZone: string;
  private _currentConfig: IConfig = null;
  private _availableTimeZones: ITimeZone[] = [];

  constructor() {
    this._currentIANATimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  public get Ready(): boolean {
    return this._ready;
  }

  public get UserLogin(): string {
    return this._userLogin;
  }

  public get Locale(): string {
    return this._locale;
  }

  public get IANATimeZone(): string {
    return this._currentIANATimeZone;
  }

  public get ConfigType(): CONFIG_TYPE {
    return this._configType;
  }

  public get Config(): IConfig {
    return this._currentConfig;
  }

  public get GroupId(): string {
    return this._groupId;
  }

  public get TeamName(): string {
    return this._teamName;
  }

  public set ConfigRefresh(value: () => void) {
    try {
      this._configRefresh = value;
      if (this._needsConfigRefresh) {
        this._configRefresh();
        this._needsConfigRefresh = false;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (ConfigRefresh) - ${err.message}`, LogLevel.Error);
    }
  }

  public set HandleExecuteDeepLink(value: (meetingUrl: string) => void) {
    this._executeDeepLink = value;
  }

  public ExecuteDeepLink(meetingUrl: string): void {
    if (typeof this._executeDeepLink == "function") {
      this._executeDeepLink(meetingUrl);
    }
  }

  public get CurrentUser(): IPerson {
    try {
      if (this._configType === CONFIG_TYPE.Team) {
        const currentUser = find(this._currentConfig.members, { userPrincipal: this._userLogin.toLowerCase() });
        return currentUser;
      } else {
        return this._currentConfig.configPerson;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (CurrentUser) - ${err.message}`, LogLevel.Error);
      return null;
    }
  }

  public get AvailableTimeZones(): ITimeZone[] {
    return this._availableTimeZones;
  }

  public async Init(loginName: string, locale: string, siteUrl: string, groupId: string, teamName: string, configType: CONFIG_TYPE): Promise<void> {
    try {
      this._userLogin = loginName;
      this._siteUrl = siteUrl;
      this._groupId = groupId;
      this._teamName = teamName;
      this._locale = locale.substr(0, 2);
      this._configType = configType;
      await this._getConfig();
      await this._getAvailableTimeZones();
      this._ready = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (init) - ${err.message}`, LogLevel.Error);
    }
  }

  private _readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private _arrayBufferToString(arrayBuffer, decoderType = 'utf-8') {
    let decoder = new TextDecoder(decoderType);
    return decoder.decode(arrayBuffer);
  }

  private async _getConfig(): Promise<void> {
    try {
      let newFile: boolean = false;
      if (this._configType === CONFIG_TYPE.Team) {
        try {
          this._currentConfig = await sp.web.getFileByServerRelativeUrl(`${this._siteUrl}/SiteAssets/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}`).getJSON();
        } catch (e) {
          //Do Nothing as it'll just create the new config.
        }
      } else {
        try {
          const file = await graphGet(GraphQueryable(graph.me.drive.toUrl(), `root:/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}:/`));
          this._configItemId = file.id;
          const fileContents = await graph.me.drive.getItemById(this._configItemId).getContent();
          const content = await this._readFileAsync(fileContents);
          this._currentConfig = JSON.parse(this._arrayBufferToString(content));
        } catch (e) {
          //Do nothing as it'll just create the new config.
        }
      }

      if (this._currentConfig == undefined || (this._currentConfig.members.length < 1 && this._currentConfig.defaultViewId == null)) {
        newFile = true;
        this._currentConfig = await this._wcm.GenerateConfig();
        this._wcm.UpdateTimezones(this._currentConfig.members);
        this.UpdateConfig(undefined, newFile);
      } else {
        this._wcm.UpdateTeamMembers(this._currentConfig.members).then((updateTeam) => {
          const updateTimezones = this._wcm.UpdateTimezones(this._currentConfig.members);
          if (updateTeam || updateTimezones) {
            if (typeof this._configRefresh === "function") {
              this._configRefresh();
            } else {
              this._needsConfigRefresh = true;
            }
            this.UpdateConfig();
          }
        });
      }

      //Validate Team Members Offsets
      if (this._currentConfig.members?.length > 0) {
        const now = DateTime.utc().millisecond;
        forEach(this._currentConfig.members, (o) => {
          if (o.IANATimeZone?.length > 0) {
            o.offset = IANAZone.create(o.IANATimeZone).offset(now);
          } else {
            o.offset = 0;
          }
        });
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getConfig) - ${err} - `, LogLevel.Error);
    }
  }

  public async UpdateConfig(config?: IConfig, newFile: boolean = false): Promise<boolean> {
    let retVal: boolean = false;
    try {
      if (config != undefined) {
        this._currentConfig = config;
      }
      const serverRelUrl = await sp.web.select("ServerRelativeUrl")();
      let configFile;
      if (wc.ConfigType === CONFIG_TYPE.Team) {
        if (newFile) {
          //Validate folder
          try {
            const folder = await sp.web.getFolderByServerRelativeUrl(`${serverRelUrl.ServerRelativeUrl}/SiteAssets/${this.CONFIG_FOLDER}`)();
          } catch (e) {
            const folder2 = await sp.web.getFolderByServerRelativeUrl(`${serverRelUrl.ServerRelativeUrl}/SiteAssets`).addSubFolderUsingPath(`${this.CONFIG_FOLDER}`);
          }
          configFile = await sp.web.getFolderByServerRelativeUrl(`${serverRelUrl.ServerRelativeUrl}/SiteAssets/${this.CONFIG_FOLDER}`).files.addUsingPath(`${this.CONFIG_FILE_NAME}`, JSON.stringify(this._currentConfig));
        } else {
          configFile = await sp.web.getFileByServerRelativeUrl(`${serverRelUrl.ServerRelativeUrl}/SiteAssets/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}`).setContent(JSON.stringify(this._currentConfig));
        }
        if (configFile.data)
          retVal = true;
      } else if (wc.ConfigType == CONFIG_TYPE.Personal) {
        if (newFile) {
          configFile = await graphPut(GraphQueryable(graph.me.drive.toUrl(), `root:/${this.CONFIG_FOLDER}/${this.CONFIG_FILE_NAME}:/content`), { body: JSON.stringify(this._currentConfig) });
          if (configFile?.id) {
            this._configItemId = configFile.id;
          }
        } else {
          configFile = await graphPut(GraphQueryable(graph.me.drive.toUrl(), `items/${this._configItemId}/content`), { body: JSON.stringify(this._currentConfig) });
        }
        if (configFile) {
          retVal = true;
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateConfig) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public GetTeamMembers(members: string[]): IPerson[] {
    let retVal: IPerson[] = [];
    try {
      retVal = filter(this._currentConfig.members, (o) => {
        return members.indexOf(o.personId) > -1;
      });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (GetTeamMembers) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public RemoveTeamMember(member: IPerson): boolean {
    let retVal: boolean = false;
    try {
      forEach(this._currentConfig.views, (v) => {
        const viewIdx = v.members.indexOf(member.personId);
        if (viewIdx > -1) {
          v.members.splice(viewIdx, 1);
        }
      });
      const memberIdx = findIndex(this._currentConfig.members, { personId: member.personId });
      if (memberIdx > -1) {
        this._currentConfig.members.splice(memberIdx, 1);
      }
      // if (typeof this._configRefresh === "function") {
      //   this._configRefresh();
      // }
      this.UpdateConfig();
      retVal = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (RemoveTeamMember) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async SearchMember(query: string): Promise<IPerson[]> {
    let retVal: IPerson[] = [];
    try {
      let members: { id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string, userType: string }[] = null;
      if (this._configType === CONFIG_TYPE.Personal) {
        members = await graph.users.top(20)
          .select("id,displayName,jobTitle,mail,userPrincipalName,userType")
          .filter(`startswith(displayName,'${query}')`)
          .get<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, mail: string, userType: string }[]>();
        const people = await graphGet<{ id: string, userPrincipalName: string, displayName: string, jobTitle: string, scoredEmailAddresses: { address: string }[], personType: { class: string, subclass: string } }[]>(
          GraphQueryable(graph.me.toUrl(), `people?$search="${query}"&$select=id,displayName,jobTitle,userPrincipalName,scoredEmailAddresses,personType`)
        );
        if (people.length > 0) {
          forEach(people, (o) => {
            if (find(members, { id: o.id }) == null) {
              members.push({ id: o.id, userPrincipalName: o.userPrincipalName, displayName: o.displayName, jobTitle: o.jobTitle, mail: o.scoredEmailAddresses[0].address, userType: (o.personType.subclass === 'OrganizationUser') ? "Member" : "Guest" });
            }
          });
          members = sortBy(members, "displayName");

          if (members?.length > 0) {
            forEach(members, (o) => {
              if (o.userPrincipalName?.toLowerCase() !== wc.UserLogin?.toLowerCase()) {
                const ext = (o.userType.toLowerCase() == "member") ? false : true;
                const p = new Person(o.id, o.userPrincipalName?.toLowerCase(), (ext) ? PERSON_TYPE.LocGuest : PERSON_TYPE.Employee, o.displayName, o.jobTitle, o.mail);
                retVal.push(p);
              }
            });
          }
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (SearchMember) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public AddMember(newMember: IPerson): boolean {
    let retVal: boolean = false;
    try {
      //Validate if exists
      const memberIdx = findIndex(this._currentConfig.members, { personId: newMember.personId });
      if (memberIdx === -1) {
        this._currentConfig.members.push(newMember);
        retVal = true;
        this._wcm.UpdateTimezones(this._currentConfig.members);
        this.UpdateConfig();
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (AddMember) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public UpdateMember(member: IPerson): boolean {
    let retVal: boolean = false;
    try {
      const memberIdx = findIndex(this._currentConfig.members, { personId: member.personId });
      if (memberIdx > -1) {
        this._currentConfig.members[memberIdx] = member;
        this._wcm.UpdateTimezones(this._currentConfig.members);
        if (typeof this._configRefresh === "function") {
          this._configRefresh();
        }
        this.UpdateConfig();
        retVal = true;
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (UpdateMember) - ${err.message}`, LogLevel.Error);
    }
    return retVal;
  }

  public async _getAvailableTimeZones(): Promise<void> {
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
    this._availableTimeZones = retVal;
  }


}

export const wc = new WorldClockService();