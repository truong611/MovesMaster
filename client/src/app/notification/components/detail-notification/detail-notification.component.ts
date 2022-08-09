import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';

import { DatePipe } from "@angular/common";

import { NotificationService } from '../../../shared/services/notification.services';

@Component({
  selector: 'app-detail-notification',
  templateUrl: './detail-notification.component.html',
  styleUrls: ['./detail-notification.component.css'],
  
})
export class DetailNotificationComponent implements OnInit {
  loading: boolean = false;

  notification = null;
  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    public data: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.notification = this.data.data.notification;
    this.notification.Created_Date_Text = this.datePipe.transform(this.notification.Created_Date, 'MMMM d, y, hh:mm');
    this.updateIsSeenNotification();
  }

  async updateIsSeenNotification() {
    if(this.notification?.Is_Seen) {
      return;
    }

    try {
      this.loading = true;
      let { data, loading }: any = await this.notificationService.updateIsSeenNotification(this.notification?.Notification_ID);
      this.loading = loading;
      if (data.updateIsSeenNotification.messageCode != 200) {
        this.showMessage('error', data.updateIsSeenNotification.message);
        return;
      }

    } catch (error) {
      this.showMessage('error', error);
    }
  }

  cancel() {
    this.ref.close();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
