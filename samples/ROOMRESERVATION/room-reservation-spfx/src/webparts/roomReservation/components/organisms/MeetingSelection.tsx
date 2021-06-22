import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { IMeetingResult, IRoomResults } from "../../models/rr.models";
import Button from "../atoms/Button";
import { cloneDeep } from "lodash";
import { rr } from "../../services/rr.service";
import LinkButton from "../atoms/LinkButton";
import Label from "../atoms/Label";
import TextBox from "../atoms/TextBox";

export interface IMeetingSelectionProps {
  meeting: IMeetingResult;
  room: IRoomResults;
  scheduled: boolean;
  bookRoom: (selectedMeeting: IMeetingResult) => void;
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

  constructor(props: IMeetingSelectionProps) {
    super(props);
    this.state = new MeetingSelectionState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingSelectionProps>, nextState: Readonly<IMeetingSelectionState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private _toggleMapVisibility() {
    const mapVisibility: boolean = cloneDeep(this.state.mapVisibility);
    this.setState({ mapVisibility: !mapVisibility, directionsVisibility: false });
  }
  private _toggleDirectionsVisibility() {
    rr.ExecuteDeepLink("https://www.bing.com/maps?cp=47.677797~-122.122013&toWww=1&redig=A9C4177289EC47A7BD49B4E69EC09585");
    const directionsVisibility: boolean = cloneDeep(this.state.directionsVisibility);
    this.setState({ directionsVisibility: !directionsVisibility, mapVisibility: false });
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

  public render(): React.ReactElement<IMeetingSelectionProps> {
    try {
      const imageSrc: any = require(`../assets/card-${this.props.room.roomId}.jpg`);
      const floorPlanSrc: any = require(`../assets/floorplan-${this.props.room.roomId}.jpg`);

      return (
        <div className="meetingroom-selection">
          <h2 className="meetingroom-title">{`${this.props.meeting.displayTime} - ${this.props.meeting.subject}`}</h2>
          <div className="meetingroom-closeup">
            <img src={imageSrc} alt="" className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-floorplan">
            <img src={floorPlanSrc} alt="" className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-info">
            <h2 className="meetingroom-name">{this.props.room.displayName}</h2>
            <address className="meetingroon-address">
              <strong>{this.props.meeting.buildingDisplayName}</strong><br />
              {this.props.meeting.buildingAddress}<br />
              {`${this.props.meeting.buildingCity} ${this.props.meeting.buildingState} ${this.props.meeting.buildingPostalCode}, ${this.props.meeting.buildingCountry}`}<br />
              <div className="meetingroom-phone">
                <strong>Phone:</strong> <a href={`tel://${this.props.meeting.buildingPhone}`}>{this.props.meeting.buildingPhone}</a>
              </div>
            </address>
            <div className="meetingroom-actions">
              <div className="meetingroom-action">
                <Button className="hoo-button" disabled={false} label={`${(this.state.mapVisibility) ? "Hide Map" : "Show Map"}`} onClick={() => this._toggleMapVisibility()} />
              </div>
              <div className="meetingroom-action">

                <LinkButton
                  linkUrl={`https://bing.com/maps/default.aspx?rtp=~pos.${this.props.meeting.buildingLat}_${this.props.meeting.buildingLong}&rtop=0~1~0&lvl=15`}
                  newWindow={true}
                  className="hoo-button"
                  disabled={false}
                  label={`Plan Trip`} onClick={() => this._toggleDirectionsVisibility()} />
              </div>
              {(this.props.scheduled) &&
                <div className="meetingroom-action">
                  <Button className="hoo-button-primary" disabled={false} label="Fill Out Covid Form" onClick={() => { }} />
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
                <h2>Request Room</h2>
                <div className="booking-info">
                  <Label label="Primary Contact" labelFor="primaryContact" />
                  <TextBox name="primaryContact" value={this.state.primaryContact} onChange={this._onTextChange} />
                </div>
                <div className="booking-info">
                  <Label label="Secondary Contact" labelFor="secondaryContact" />
                  <TextBox name="secondaryContact" value={this.state.secondaryContact} onChange={this._onTextChange} />
                </div>

                <div className="meetingroom-action">
                  <Button className="hoo-button-primary" disabled={false} label="Request this room" onClick={() => this.props.bookRoom(this.props.meeting)} />
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