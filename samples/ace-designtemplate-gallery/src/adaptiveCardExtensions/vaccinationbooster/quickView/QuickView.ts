import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'VaccinationboosterAdaptiveCardExtensionStrings';
import { IVaccinationboosterAdaptiveCardExtensionProps } from '../VaccinationboosterAdaptiveCardExtension';
import { VaccineAppointment } from '../../../common/models/designtemplate.models';
import { dtg } from '../../../common/services/designtemplate.service';

export interface IQuickViewData {
  logo: string;
  mainImage: string;
  strings: IVaccinationboosterAdaptiveCardExtensionStrings;
}

export class QuickView extends BaseAdaptiveCardView<
  IVaccinationboosterAdaptiveCardExtensionProps,
  IQuickViewData
> {
  private LOG_SOURCE = "🔶 Vaccine Booster Quick View";
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
        const { id } = action;
        if (id === 'btn_cancel') {
          this.quickViewNavigator.close();
        } else if (id === 'btn_submit') {
          const request: VaccineAppointment = new VaccineAppointment(action.data?.vaccine_date, action.data?.vaccine, action.data?.booster_date, action.data?.vaccine_booster_type);
          dtg.SubmitVaccineAppointment(request);
          this.quickViewNavigator.close();
        }
      }
    } catch (err) {
      console.error(
        `${this.LOG_SOURCE} (onAction) -- click event not handled. - ${err}`
      );
    }
  }
}