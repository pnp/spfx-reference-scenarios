import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import strings from "RoomReservationWebPartStrings";

export interface IMeetingRoomsProps {
}

export interface IMeetingRoomsState {
}

export class MeetingRoomsState implements IMeetingRoomsState {
  constructor() { }
}

export default class MeetingRooms extends React.Component<IMeetingRoomsProps, IMeetingRoomsState> {
  private LOG_SOURCE: string = "🔶 MeetingRooms";

  constructor(props: IMeetingRoomsProps) {
    super(props);
    this.state = new MeetingRoomsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IMeetingRoomsProps>, nextState: Readonly<IMeetingRoomsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IMeetingRoomsProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <h2 className="meeting-headline">{strings.AvailableRoomsLabel}</h2>
          <div className="meeting-room-selector">
            <div className="meeting-rooms">
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-1.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Atlantic</div>
              </div>
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-2.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Pacific</div>
              </div>
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-3.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Indian Ocean</div>
              </div>
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-4.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Souther Ocean</div>
              </div>
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-5.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Arctic Ocean</div>
              </div>
              <div className="hoo-meetingcard">
                <div className="hoo-cardimage">
                  <img src="../../images/card-images/meeting-cards/card-6.jpg" width="320" height="180" alt="" />
                </div>
                <div className="hoo-cardlocation">Microsoft HQ</div>
                <div className="hoo-cardtitle">Arctic Ocean</div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}