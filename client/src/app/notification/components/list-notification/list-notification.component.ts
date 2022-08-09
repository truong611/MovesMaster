import { Component, OnInit } from '@angular/core';

import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { NotificationService } from '../../../shared/services/notification.services';
import { DetailNotificationComponent } from '../detail-notification/detail-notification.component';

@Component({
  selector: 'app-list-notification',
  templateUrl: './list-notification.component.html',
  styleUrls: ['./list-notification.component.css']
})
export class ListNotificationComponent implements OnInit {
  loading: boolean = false;
  type: number = 1;
  globalFilter = null;

  first: number = 0;
  totalRecords: number = 0;
  rows: number = 50;

  listAllNotification: any = [];
  listNotification: any = [];
  listPageNotification: any = [];

  constructor(
    public notificationService: NotificationService,
    public messageService: MessageService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.getListAllNotification()
  }

  async getListAllNotification() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.notificationService.getListAllNotification();
      this.loading = loading;

      if (data.getListAllNotification.messageCode != 200) {
        this.showMessage('error', data.getListAllNotification.message);
        return;
      }
      this.listAllNotification = data.getListAllNotification.ListNotification.map((item) =>
        Object.assign({
          Created_Date_Text: null
        }, item)
      );
      this.listNotification = data.getListAllNotification.ListNotification.map((item) =>
        Object.assign({
          Created_Date_Text: null
        }, item)
      );;

      this.totalRecords = this.listNotification.length;
      this.getDataPage(0, this.rows);
    }
    catch (e) {
      this.showMessage('error', e);
    }
  }

  sortNotification(type) {
    this.type = type;
    if (type == 1) {
      this.listNotification = this.listAllNotification;
    } else {
      this.listNotification = this.listAllNotification.filter(x => !x.Is_Seen);
    }

    this.totalRecords = this.listNotification.length;
    this.getDataPage(0, this.rows);
  }

  applyFilterGlobal() {
    let keySearch = this.globalFilter?.trim().toUpperCase();

    if (keySearch != null) {
      this.sortNotification(this.type);
      this.listNotification = this.listAllNotification.filter(x => keySearch != null && (x.Name.toUpperCase().includes(keySearch) || x.Email.toUpperCase().includes(keySearch) || x.Content.toUpperCase().includes(keySearch)));
    } else {
      this.listNotification = this.listAllNotification
    }

    this.totalRecords = this.listNotification.length;
    this.getDataPage(0, this.rows);
  }

  onPageChange(event) {
    this.first = event.first;
    this.getDataPage(event.first, event.rows);
  }

  getDataPage(first, rows) {
    this.listPageNotification = this.listNotification.slice(first, (first + rows));
  }

  detailNotification(data) {
    let ref = this.dialogService.open(DetailNotificationComponent, {
      data: {
        notification: data
      },
      header: 'Notificaiton',
      styleClass: 'custom-dialog',
      width: '500px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {
      this.getListAllNotification();
    });
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
