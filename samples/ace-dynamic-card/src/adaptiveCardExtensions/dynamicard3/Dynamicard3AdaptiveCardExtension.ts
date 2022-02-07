import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { QuickView } from './quickView/QuickView';
import { Dynamicard3PropertyPane } from './Dynamicard3PropertyPane';

export interface IDynamicard3AdaptiveCardExtensionProps {
  title: string;
  description: string;
  iconProperty: string;
}

export interface IDynamicard3AdaptiveCardExtensionState {
  description: string;
  image: string;
  index: number;
}

const CARD_VIEW_REGISTRY_ID: string = 'Dynamicard3_CARD_VIEW';
export const QUICK_VIEW_REGISTRY_ID: string = 'Dynamicard3_QUICK_VIEW';

const info = [
  ["Horses suffer humiliating defeat", `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDQ4IDIwNDgiPjxwYXRoIGQ9Ik0yMDQ4IDI1NnEwIDY3LTIwIDEyMHQtNTYgMTA5bC01MTYgNzc1cTM5IDYyIDU5IDEzMnQyMSAxNDRxMCAxMDYtNDAgMTk5dC0xMDkgMTYzLTE2MyAxMTAtMjAwIDQwcS0xMDYgMC0xOTktNDB0LTE2My0xMDktMTEwLTE2My00MC0yMDBxMC03MyAyMC0xNDN0NjAtMTMzTDc2IDQ4NXEtMzYtNTUtNTYtMTA4VDAgMjU2cTAtNTMgMjAtOTl0NTUtODIgODEtNTVUMjU2IDBoMTUzNnE1MyAwIDk5IDIwdDgyIDU1IDU1IDgxIDIwIDEwMHptLTQ3Mi0xMjhINDcybDE3MCAyNTZoNzY0bDE3MC0yNTZ6TTcyOCA1MTJsMjk2IDQ0NSAyOTYtNDQ1SDcyOHpNMTI4IDI1NnEwIDQ2IDE0IDgydDM5IDc0bDQ5OCA3NDZxNTEtNDcgMTEyLTc4dDEzMS00NkwzMTggMTI4aC02MnEtMjcgMC01MCAxMHQtNDAgMjctMjggNDEtMTAgNTB6bTg5NiAxNjY0cTc5IDAgMTQ5LTMwdDEyMi04MiA4My0xMjIgMzAtMTUwcTAtNzktMzAtMTQ5dC04Mi0xMjItMTIzLTgzLTE0OS0zMHEtODAgMC0xNDkgMzB0LTEyMiA4Mi04MyAxMjMtMzAgMTQ5cTAgODAgMzAgMTQ5dDgyIDEyMiAxMjIgODMgMTUwIDMwem04NDQtMTUxMHEyNS0zNCAzOC03M3QxNC04MXEwLTI3LTEwLTUwdC0yNy00MC00MS0yOC01MC0xMGgtNjJsLTYwNCA5MDZxNjkgMTQgMTMwIDQ1dDExMyA3OWw0OTktNzQ3di0xeiIgZmlsbD0iIzMzMzMzMyI+PC9wYXRoPjwvc3ZnPg==`],
  ["Peter Rabbit Remembered", `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDQ4IDIwNDgiPjxwYXRoIGQ9Ik0xNDA4IDgxN2w2MTYgMTIzMUgyNEw3NjggNTYxVjBoNTEydjM4NEg4OTZ2MTc3bDMyMCA2NDAgMTkyLTM4NHpNODk2IDEyOHYxMjhoMjU2VjEyOEg4OTZ6bTkzIDkwNUw4MzIgNzE5bC0xNTcgMzE0IDE1NyAxNTYgMTU3LTE1NnptNDQzIDg4N2wtMzgzLTc2Ny0yMTcgMjE4LTIxNy0yMTgtMzgzIDc2N2gxMjAwem0xNDQgMGgyNDBsLTQwOC04MTctMTIwIDI0MSAyODggNTc2eiIgZmlsbD0iIzMzMzMzMyI+PC9wYXRoPjwvc3ZnPg==`],
  ["Rabbit Economy Excellent", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDQ4IDIwNDgiPjxwYXRoIGQ9Ik0wIDE4OThsMzg0LTM4NHY1MzRIMHYtMTUwem01MTItNTEybDM4NC0zODR2MTA0Nkg1MTJ2LTY2MnptMTI4MC00OTBoMTI4djExNTJoLTM4NHYtOTE4bDI1Ni0yMzR6bS00NDggNDI2bDY0LTY0djc5MGgtMzg0VjEwMDJsMzIwIDMyMHptNzA0LTEwNjZ2NTEyaC0xMjhWNDc1bC01NzYgNTc1LTM4NC0zODRMMCAxNjI3di0xODJsOTYwLTk1OSAzODQgMzg0IDQ4NS00ODZoLTI5M1YyNTZoNTEyeiIgZmlsbD0iIzMzMzMzMyI+PC9wYXRoPjwvc3ZnPg=="],
];

export default class Dynamicard3AdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IDynamicard3AdaptiveCardExtensionProps,
  IDynamicard3AdaptiveCardExtensionState
> {
  private _deferredPropertyPane: Dynamicard3PropertyPane | undefined;

  public onInit(): Promise<void> {

    this.state = {
      description: info[0][0],
      image: info[0][1],
      index: -1,
    };

    const fixture = () => {

      let { index } = this.state;

      index = index < (info.length - 1) ? index + 1 : 0;

      this.setState({
        description: info[index][0],
        image: info[index][1],
        index,
      });

      setTimeout(fixture, 4000);
    };

    fixture();

    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_REGISTRY_ID, () => new QuickView());

    return Promise.resolve();
  }

  public get title(): string {
    return this.properties.title;
  }

  protected get iconProperty(): string {
    return this.properties.iconProperty || require('./assets/SharePointLogo.svg');
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'Dynamicard3-property-pane'*/
      './Dynamicard3PropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.Dynamicard3PropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return this._deferredPropertyPane!.getPropertyPaneConfiguration();
  }
}
