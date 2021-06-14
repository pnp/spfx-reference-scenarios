import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import { isEqual } from "lodash";
import strings from "RoomReservationWebPartStrings";

export interface IMeetingSelectionProps {
}

export interface IMeetingSelectionState {
}

export class MeetingSelectionState implements IMeetingSelectionState {
  constructor() { }
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

  public render(): React.ReactElement<IMeetingSelectionProps> {
    try {
      return (
        <div className="meetingroom-selection">
          <div className="meetingroom-closeup">
            <img src="../../images/card-images/meeting-cards/card-4.jpg" alt="" className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-floorplan">
            <img src="../../images/card-images/meeting-cards/floorplan.jpg" alt="" className="meetingroom-closeup-img" />
          </div>
          <div className="meetingroom-info">
            <h2 className="meetingroom-name">Southern Ocean</h2>
            <address className="meetingroon-address">
              <strong>Microsoft HQ</strong><br />
                    One Microsoft Way, Redmond,<br />
                      WA 98052, United States<br />
              <div className="meetingroom-phone">
                <strong>Phone:</strong> <a href="tel://+1 425-882-8080">+1 425-882-8080</a>
              </div>
            </address>
            <div className="meetingroom-actions">
              <div className="meetingroom-action">
                <button className="hoo-button">
                  <div className="hoo-button-label">Show Map</div>
                </button>
              </div>
              <div className="meetingroom-action">
                <button className="hoo-button">
                  <div className="hoo-button-label">Plan you trip</div>
                </button>
              </div>
              <div className="meetingroom-action">
                <button className="hoo-button">
                  <div className="hoo-button-label">Fill out Covid Form</div>
                </button>
              </div>
            </div>
            <div className="meetingroom-map">
              <iframe frameBorder="0" src="https://www.bing.com/maps/embed?h=450&w=800&cp=47.639481407051086~-122.1458888053894&lvl=14&typ=d&sty=r&src=SHELL&FORM=MBEDV8" scrolling="no">
              </iframe>
              <div >
                <a id="largeMapLink" target="_blank" href="https://www.bing.com/maps?cp=47.639481407051086~-122.1458888053894&amp;sty=r&amp;lvl=14&amp;FORM=MBEDLD">View
              Larger Map</a> &nbsp; | &nbsp;
            <a id="dirMapLink" target="_blank" href="https://www.bing.com/maps/directions?cp=47.639481407051086~-122.1458888053894&amp;sty=r&amp;lvl=14&amp;rtp=~pos.47.639481407051086_-122.1458888053894____&amp;FORM=MBEDLD">Get
              Directions</a>
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