import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

import { IMeetingResult, IRoomResults } from "../../models/rr.models";
import Button from "../atoms/Button";
import LinkButton from "../atoms/LinkButton";
import Label from "../atoms/Label";
import TextBox from "../atoms/TextBox";
import strings from "RoomReservationWebPartStrings";
import CheckBox, { ICheckBoxOption } from "../atoms/CheckBox";
import { rr } from "../../services/rr.service";
import { replace } from "lodash";

export interface IMeetingSelectionProps {
  meeting: IMeetingResult;
  room: IRoomResults;
  scheduled: boolean;
  bookRoom: (selectedMeeting: IMeetingResult) => void;
  getAvailableRooms: (meeting: IMeetingResult) => void;
}

export interface IMeetingSelectionState {
  mapVisibility: boolean;
  directionsVisibility: boolean;
  primaryContact: string;
  secondaryContact: string;
}

export class MeetingSelectionState implements IMeetingSelectionState {
  constructor(
    public mapVisibility: boolean = false,
    public directionsVisibility: boolean = false,
    public primaryContact: string = "",
    public secondaryContact: string = ""
  ) { }
}

export default class MeetingSelection extends React.Component<IMeetingSelectionProps, IMeetingSelectionState> {
  private LOG_SOURCE: string = "🔶 MeetingSelection";
  private _cateringOptions: ICheckBoxOption[] = [];
  private _avOptions: ICheckBoxOption[] = [];

  constructor(props: IMeetingSelectionProps) {
    super(props);
    strings.CateringOptions.map((o) => {
      const key = replace(o, " ").toLowerCase();
      this._cateringOptions.push({ key: key, text: o });
    });
    strings.AVOptions.map((o) => {
      const key = replace(o, " ").toLowerCase();
      this._avOptions.push({ key: key, text: o });
    });

    this.state = new MeetingSelectionState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingSelectionProps>, nextState: Readonly<IMeetingSelectionState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _toggleMapVisibility() {
    try {
      const mapVisibility: boolean = cloneDeep(this.state.mapVisibility);
      this.setState({ mapVisibility: !mapVisibility, directionsVisibility: false });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_toggleMapVisibility) - ${err}`, LogLevel.Error);
    }

  }
  private _toggleDirectionsVisibility() {
    try {
      const directionsVisibility: boolean = cloneDeep(this.state.directionsVisibility);
      this.setState({ directionsVisibility: !directionsVisibility, mapVisibility: false });
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_toggleDirectionsVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private _onTextChange = (fieldValue: string, fieldName: string) => {
    try {
      const state = cloneDeep(this.state);
      state[fieldName] = fieldValue;
      this.setState(state);
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_onTextChange) - ${err}`, LogLevel.Error);
    }
  }

  private _goToCovidApp() {
    try {
      rr.ExecuteDeepLink("https://teams.microsoft.com/l/entity/3ab8fb75-8f80-4ff1-90a3-6f711ad27c1d/0");
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (_goToCovidApp) - ${err}`, LogLevel.Error);
    }

  }

  public render(): React.ReactElement<IMeetingSelectionProps> {
    try {
      const imageSrc: any = require(`../assets/card-${this.props.room.roomId}.jpg`);
      const floorPlanSrc: any = require(`../assets/floorplan-${this.props.room.roomId}.jpg`);

      return (
        <div className="meetingroom-selection">
          <h2 className="meetingroom-title">{`${this.props.meeting.displayTime} - ${this.props.meeting.subject}`}</h2>
          <div className="meetingroom-closeup">
            <img src={imageSrc} alt={`${this.props.room.displayName}`} className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-floorplan">
            <img src={floorPlanSrc} alt={`${this.props.room.displayName} ${strings.FloorPlanLabel}`} className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-info">
            <h2 className="meetingroom-name">{this.props.room.displayName}</h2>
            <address className="meetingroon-address">
              <strong>{this.props.meeting.buildingDisplayName}</strong><br />
              {this.props.meeting.buildingAddress}<br />
              {`${this.props.meeting.buildingCity} ${this.props.meeting.buildingState} ${this.props.meeting.buildingPostalCode}, ${this.props.meeting.buildingCountry}`}<br />
              <div className="meetingroom-phone">
                <strong>{strings.PhoneLabel}:</strong> <a href={`tel://${this.props.meeting.buildingPhone}`}>{this.props.meeting.buildingPhone}</a>
              </div>
            </address>
            <div className="meetingroom-actions">
              <div className="meetingroom-action">
                <Button className="hoo-button" disabled={false} label={`${(this.state.mapVisibility) ? strings.HideMap : strings.ShowMap}`} onClick={() => this._toggleMapVisibility()} />
              </div>
              <div className="meetingroom-action">

                <LinkButton
                  linkUrl={`https://bing.com/maps/default.aspx?rtp=~pos.${this.props.meeting.buildingLat}_${this.props.meeting.buildingLong}&rtop=0~1~0&lvl=15`}
                  newWindow={true}
                  className="hoo-button"
                  disabled={false}
                  label={strings.PlanTripLabel} onClick={() => this._toggleDirectionsVisibility()} />
              </div>
              {(this.props.scheduled) &&
                <div className="meetingroom-action">
                  <Button className="hoo-button-primary" disabled={false} label={strings.CovidFormButton} onClick={() => this._goToCovidApp()} />
                </div>
              }
            </div>
            {(this.state.mapVisibility) &&
              <div className="meetingroom-map">
                <iframe frameBorder="0" src={`https://www.bing.com/maps/embed?cp=${this.props.meeting.buildingLat}~${this.props.meeting.buildingLong}&lvl=18&sty=h&src=SHELL&FORM=MBEDV8`} scrolling="no" />
              </div>
            }


            {(!this.props.scheduled) &&
              <div className="meetingroom-request">
                <h2>{strings.RequestRoom}</h2>
                <div className="booking-info">
                  <Label label={strings.PrimaryContactLabel} labelFor="primaryContact" />
                  <TextBox name="primaryContact" value={this.state.primaryContact} onChange={this._onTextChange} />
                </div>
                <div className="booking-info">
                  <Label label={strings.SecondaryContactLabel} labelFor="secondaryContact" />
                  <TextBox name="secondaryContact" value={this.state.secondaryContact} onChange={this._onTextChange} />
                </div>
                <div className="booking-info">
                  <Label label={strings.CateringLabel} labelFor="cateringOptions" />
                  <CheckBox name="cateringOptions" value="" options={this._cateringOptions} onChange={() => { }} />
                </div>
                <div className="booking-info">
                  <Label label={strings.AVLabel} labelFor="avOptions" />
                  <CheckBox name="avOptions" value="" options={this._avOptions} onChange={() => { }} />
                </div>
                <div className="meetingroom-actions">
                  <div className="meetingroom-action">
                    <Button className="hoo-button-primary" disabled={false} label={strings.RequestRoomButton} onClick={() => this.props.bookRoom(this.props.meeting)} />
                  </div>
                  <div className="meetingroom-action">
                    <Button className="hoo-button-primary" disabled={false} label={strings.SelectDifferentRoom} onClick={() => this.props.getAvailableRooms(this.props.meeting)} />
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}