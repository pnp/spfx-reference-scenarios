import { Logger, LogLevel } from "@pnp/logging";
import * as lodash from "lodash";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields/list";
import "@pnp/sp/views/list";
import "@pnp/sp/site-groups";
import "@pnp/sp/security";

import { Tables, IFieldList, QUESTIONLISTFields, SELFCHECKINLISTFields, COVIDCHECKINLISTFields } from "./covid.model";
import { DateTimeFieldFormatType, CalendarType, DateTimeFieldFriendlyFormatType, UrlFieldFormatType, FieldUserSelectionMode } from "@pnp/sp/fields/types";
import { IList } from "@pnp/sp/lists";

export interface ICovidConfigService {

}

export class CovidConfigService implements ICovidConfigService {
  private LOG_SOURCE: string = "CovidConfigService";

  private _valid: boolean = false;

  constructor() {
  }

  get Valid(): boolean {
    return this._valid;
  }

  public async isValid(): Promise<boolean> {
    try {
      const list = await sp.web.lists.getByTitle(Tables.COVIDCHECKINLIST)();
      this._valid = true;
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (isValid) - Covid System has not been configured.`, LogLevel.Error);
    }
    return this._valid;
  }

  public async configure(): Promise<boolean> {
    try {
      const siteVisitorsPermissions = await this.getRoleInformation();
      const successLocations = await this.createList(Tables.LOCATIONLIST, []);
      const successQuestions = await this.createList(Tables.QUESTIONLIST, QUESTIONLISTFields);
      const successSelfCheckin = await this.createList(Tables.SELFCHECKINLIST, SELFCHECKINLISTFields);
      if (successSelfCheckin) {
        await successSelfCheckin.breakRoleInheritance(true);
        if (siteVisitorsPermissions.length > 0) {
          await successSelfCheckin.roleAssignments.getById(siteVisitorsPermissions[0]).delete();
          await successSelfCheckin.roleAssignments.add(siteVisitorsPermissions[0], siteVisitorsPermissions[1]);
        } else {
          Logger.write(`${this.LOG_SOURCE} (configure) - SelfCheckIn list created but permissions could not be set.`, LogLevel.Error);
          return false;
        }
      }
      const successCheckin = await this.createList(Tables.COVIDCHECKINLIST, COVIDCHECKINLISTFields);
      if (successCheckin) {
        await successCheckin.breakRoleInheritance(true);
        if (siteVisitorsPermissions.length > 0) {
          await successCheckin.roleAssignments.getById(siteVisitorsPermissions[0]).delete();
        } else {
          Logger.write(`${this.LOG_SOURCE} (configure) - CovidCheckIn list created but permissions could not be set.`, LogLevel.Error);
          return false;
        }
      }
      this._valid = (successCheckin != null && successLocations != null && successQuestions != null && successSelfCheckin != null);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (configure) - ${err} - `, LogLevel.Error);
    }
    return this._valid;
  }

  private async createList(listName: string, fieldList: IFieldList[]): Promise<IList> {
    let retVal: IList = null;
    try {
      const l = await sp.web.lists.add(listName, listName, 100);
      if (l.list != null) {
        for (let i = 0; i < fieldList.length; i++) {
          if (fieldList[i].props.FieldTypeKind === 2) {
            await sp.web.lists.getById(l.data.Id).fields.addText(fieldList[i].name);
          } else if (fieldList[i].props.FieldTypeKind === 3) {
            if (fieldList[i].props.richText) {
              await sp.web.lists.getById(l.data.Id).fields.createFieldAsXml(
                `<Field Type="Note" Name="${fieldList[i].name}" DisplayName="${fieldList[i].name}" Required="FALSE" RichText="TRUE" RichTextMode="FullHtml" />`
              );
            } else {
              await sp.web.lists.getById(l.data.Id).fields.addMultilineText(fieldList[i].name, 6, false, false, false, false);
            }
          } else if (fieldList[i].props.FieldTypeKind === 4) {
            await sp.web.lists.getById(l.data.Id).fields.addDateTime(fieldList[i].name, DateTimeFieldFormatType.DateTime, CalendarType.Gregorian, DateTimeFieldFriendlyFormatType.Disabled);
          } else if (fieldList[i].props.FieldTypeKind === 6) {
            await sp.web.lists.getById(l.data.Id).fields.addChoice(fieldList[i].name, fieldList[i].props.choices);
          } else if (fieldList[i].props.FieldTypeKind === 8) {
            await sp.web.lists.getById(l.data.Id).fields.addBoolean(fieldList[i].name);
          } else if (fieldList[i].props.FieldTypeKind === 9) {
            await sp.web.lists.getById(l.data.Id).fields.addNumber(fieldList[i].name);
          } else if (fieldList[i].props.FieldTypeKind === 11) {
            await sp.web.lists.getById(l.data.Id).fields.addUrl(fieldList[i].name, UrlFieldFormatType.Hyperlink);
          } else if (fieldList[i].props.FieldTypeKind === 20) {
            await sp.web.lists.getById(l.data.Id).fields.addUser(fieldList[i].name, FieldUserSelectionMode.PeopleOnly);
          }
        }
        let view = await sp.web.lists.getById(l.data.Id).defaultView;
        for (let i = 0; i < fieldList.length; i++) {
          await view.fields.add(fieldList[i].name);
        }
        retVal = l.list;
      }
    } catch (err) {
      Logger.write(`${err} - ${this.LOG_SOURCE} (createList)`, LogLevel.Error);
    }
    return retVal;
  }

  private async getRoleInformation(): Promise<number[]> {
    let retVal: number[] = [];
    try {
      let targetGroup = await sp.web.associatedVisitorGroup();
      let targetGroupId = targetGroup.Id;
      let roleDefinition = await sp.web.roleDefinitions.getByType(3).get();
      let roleDefinitionId = roleDefinition.Id;
      retVal.push(targetGroupId);
      retVal.push(roleDefinitionId);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getRoleInformation) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }
}

export const ccs = new CovidConfigService();