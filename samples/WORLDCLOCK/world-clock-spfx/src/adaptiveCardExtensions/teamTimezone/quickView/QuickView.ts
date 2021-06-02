import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import { ITeamTimezoneAdaptiveCardExtensionProps, ITeamTimezoneAdaptiveCardExtensionState } from '../TeamTimezoneAdaptiveCardExtension';

import { Logger, LogLevel } from "@pnp/logging";

import { forEach } from 'lodash';
import { DateTime } from 'luxon';
import { IPerson, IWCView } from '../../../webparts/worldClock/models/wc.models';
import { wc } from '../../../webparts/worldClock/services/wc.service';

export interface IQuickViewData {
  title: string;
  url: string;
  members: { displayName: string; currentTime: string; }[];
}

export class QuickView extends BaseAdaptiveCardView<
  ITeamTimezoneAdaptiveCardExtensionProps,
  ITeamTimezoneAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 QuickView";

  private _getTime(member: IPerson): string {
    let retVal: string = "unknown";
    try {
      if (member.IANATimeZone != undefined) {
        retVal = DateTime.now().setZone(member.IANATimeZone).toLocaleString(DateTime.TIME_SIMPLE);
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_getTime) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get data(): IQuickViewData {
    let retVal: IQuickViewData = null;
    try {
      const view: IWCView = this.state.currentConfig.views[this.state.currentView];
      if (view) {
        const viewMembers: IPerson[] = wc.GetTeamMembers(view.members);
        const members: { displayName: string; currentTime: string }[] = [];
        forEach(viewMembers, (vm: IPerson) => {
          members.push({ displayName: vm.displayName, currentTime: this._getTime(vm) });
        });
        retVal = { title: view.viewName, url: this.state.teamsUrl, members: members };
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (data) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}