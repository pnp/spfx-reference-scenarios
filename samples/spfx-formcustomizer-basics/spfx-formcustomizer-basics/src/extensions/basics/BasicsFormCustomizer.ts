import { FormDisplayMode } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility';
import * as strings from 'BasicsFormCustomizerStrings';
import styles from './BasicsFormCustomizer.module.scss';

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IBasicsFormCustomizerProperties {
  // This is an example; replace with your own property
  sampleText?: string;
}

export default class BasicsFormCustomizer extends BaseFormCustomizer<IBasicsFormCustomizerProperties> {
  // item to show in the form; use with edit and view form
  private _item: {
    Title?: string;
  };
  // item's etag to ensure integrity of the update; used with edit form
  private _etag?: string;

  public onInit(): Promise<void> {
    if (this.displayMode === FormDisplayMode.New) {
      // we're creating a new item so nothing to load
      return Promise.resolve();
    }

    // load item to display on the form
    return this.context.spHttpClient
      .get(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('${this.context.list.title}')/items(${this.context.itemId})`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (res.ok) {
          // store etag in case we'll need to update the item
          this._etag = res.headers.get('ETag');
          return res.json();
        }
        else {
          return Promise.reject(res.statusText);
        }
      })
      .then(item => {
        this._item = item;
        return Promise.resolve();
      });
  }

  public render(): void {
    // render view form
    if (this.displayMode === FormDisplayMode.Display) {
      this.domElement.innerHTML = `<div class="${styles.basics}">
      <label for="title">${strings.Title}</label><br />
      ${this._item?.Title}
      <br /><br />
      <input type="button" id="cancel" value="${strings.Close}" />
    </div>`;

      document.getElementById('cancel').addEventListener('click', this._onClose.bind(this));
    }
    // render new/edit form
    else {
      this.domElement.innerHTML = `<div class="${styles.basics}">
    <label for="title">${strings.Title}</label><br />
    <input type="text" id="title" value="${this._item?.Title || ''}"/>
    <br /><br />
    <input type="button" id="save" value="${strings.Save}" />
    <input type="button" id="cancel" value="${strings.Cancel}" />
    <br /><br />
    <div class="${styles.error}"></div>
  </div>`;

      document.getElementById('save').addEventListener('click', this._onSave.bind(this));
      document.getElementById('cancel').addEventListener('click', this._onClose.bind(this));
    }
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    super.onDispose();
  }

  // eslint-disable-next-line @microsoft/spfx/no-async-await
  private _onSave = async (): Promise<void> => {
    // disable all input elements while we're saving the item
    this.domElement.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'));
    // reset previous error message if any
    this.domElement.querySelector(`.${styles.error}`).innerHTML = '';

    let request: Promise<SPHttpClientResponse>;
    const title: string = (document.getElementById('title') as HTMLInputElement).value;

    switch (this.displayMode) {
      case FormDisplayMode.New:
        request = this._createItem(title);
        break;
      case FormDisplayMode.Edit:
        request = this._updateItem(title);
    }

    const res: SPHttpClientResponse = await request;

    if (res.ok) {
      // You MUST call this.formSaved() after you save the form.
      this.formSaved();
    }
    else {
      const error: { error: { message: string } } = await res.json();

      this.domElement.querySelector(`.${styles.error}`).innerHTML = `An error has occurred while saving the item. Please try again. Error: ${error.error.message}`;
      this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'));
    }
  }

  private _onClose = (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed();
  }

  private _createItem(title: string): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('${this.context.list.title}')/items`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none'
        },
        body: JSON.stringify({
          Title: title
        })
      });
  }

  private _updateItem(title: string): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('${this.context.list.title}')/items(${this.context.itemId})`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          'if-match': this._etag,
          'x-http-method': 'MERGE'
        },
        body: JSON.stringify({
          Title: title
        })
      });
  }
}
