import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VaccinationboosterAdaptiveCardExtensionStrings';
import { Logger, LogLevel } from "@pnp/logging";
import { IVaccinationboosterAdaptiveCardExtensionProps, IVaccinationboosterAdaptiveCardExtensionState } from '../VaccinationboosterAdaptiveCardExtension';
import { dtg } from '../../../common/services/designtemplate.service';
import { VaccineAppointment } from '../../../common/models/designtemplate.models';

export interface IQuickViewData {
  logo: string;
  mainImage: string;
  strings: IVaccinationboosterAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IVaccinationboosterAdaptiveCardExtensionProps,
  IVaccinationboosterAdaptiveCardExtensionState,
  IQuickViewData
> {
  private LOG_SOURCE: string = "🔶 Vaccine Booster Quick View";
  public get data(): IQuickViewData {
    return {
      logo: require('../../../common/images/vaccination-booster/HealthCenterLogo.png'),
      mainImage: require('../../../common/images/vaccination-booster/vaccineimage.jpg'),
      strings: strings
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
  public async onAction(action: ISubmitActionArguments): Promise<void> {
    try {
      if (action.type === 'Submit') {
        const { id, data } = action;
        if (id === 'btn_cancel') {
          this.quickViewNavigator.close();
        } else if (id === 'btn_submit') {
          const request: VaccineAppointment = new VaccineAppointment(action.data?.vaccine_date, action.data?.vaccine, action.data?.booster_date, action.data?.vaccine_booster_type);
          dtg.SubmitVaccineAppointment(request);
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (onAction) - ${err}`, LogLevel.Error);
    }
  }
}