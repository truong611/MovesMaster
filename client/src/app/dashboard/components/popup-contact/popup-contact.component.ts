import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';

import { NotificationService } from 'src/app/shared/services/notification.services';
import { NotificationInput } from '../../models/charity.model';

@Component({
  selector: 'app-popup-contact',
  templateUrl: './popup-contact.component.html',
  styleUrls: ['./popup-contact.component.css']
})
export class PopupContactComponent implements OnInit {
  loading: boolean = false;
  Content = null;
  Charity_ID = null;
  Company_ID = null;
  type = null;
  user: any;

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    public data: DynamicDialogConfig,
    private ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.type = this.data.data.type; //type: 4-charity, 5-company
    if(this.type == 4) {
      this.Charity_ID = this.data.data.objectId;
    }
    if(this.type == 5) {
      this.Company_ID = this.data.data.objectId;
    }

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  async save() {
    if(!this.Content || (this.Content && !this.Content.trim())) {
      this.showMessage('error', "Content cannot be left blank");
      return;
    }
    let dataSave: NotificationInput = {
      Notification_To_Charity_ID: this.Charity_ID,
      Notification_To_Company_ID: this.Company_ID,
      Content: this.Content.trim()
    }


    try {
      this.loading = true;
      let { data, loading }: any = await this.notificationService.createNotification(dataSave);
      this.loading = loading;
      if (data.createNotification.messageCode != 200) {
        this.showMessage('error', data.createNotification.message);
        return;
      }
      this.showMessage('success', data.createNotification.message);
      this.cancel()

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
