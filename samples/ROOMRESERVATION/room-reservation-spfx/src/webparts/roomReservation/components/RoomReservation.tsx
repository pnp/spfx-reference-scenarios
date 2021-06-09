import * as React from 'react';
import styles from './RoomReservation.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';

export interface IRoomReservationProps { }

export default class RoomReservation extends React.Component<IRoomReservationProps, {}> {
  public render(): React.ReactElement<IRoomReservationProps> {
    return (
      <div className={styles.roomReservation}>

      </div>
    );
  }
}
