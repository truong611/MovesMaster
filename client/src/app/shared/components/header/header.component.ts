import { NotificationService } from './../../services/notification.services';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from "../../../auth/services/authentication.service";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { DetailNotificationComponent } from '../../../notification/components/detail-notification/detail-notification.component';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  query: Subscription;
  countNotification: number = 0;
  listNotification: any = [];

  user: any;
  textHeader: any;
  iconHeader: any = null;

  constructor(
    private authService: AuthenticationService,
    public notificationService: NotificationService,
    public router: Router,
    public messageService: MessageService,
    private dialogService: DialogService,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getTotalNotification();

    this.notificationService.getTotalNotification().subscribeToMore({
      document: this.notificationService._subscriptionNotificationCount,
      updateQuery: (prev, { subscriptionData }) => {
        this.getTotalNotification();
      }
    });

    this.user = JSON.parse(localStorage.getItem('user'));
    this.textHeader = this.user.Charity_Name ?? this.user.Company_Name;
    if(this.user?.IsAdmin) {
      this.iconHeader = '/assets/img/logo_text_white.png';
    } else {
      this.iconHeader = this.user?.Charity_icon ? this.user?.Charity_icon : (this.user?.Company_Icon ? this.user?.Company_Icon : '/assets/img/Default Image.png');
    }
  }

  getTotalNotification() {
    this.query = this.notificationService.getTotalNotification().valueChanges.subscribe({
      next: ({ data }) => { this.countNotification = data.getTotalNotification.Total; },
      error: (e) => console.error(e)
    });
  }

  async getListNotification() {
    try {
      let { data }: any = await this.notificationService.getListNotification();

      if (data.getListNotification.messageCode != 200) {
        this.showMessage('error', data.getListNotification.message);
        return;
      }
      this.listNotification = data.getListNotification.ListNotification.map((item) =>
        Object.assign({
          TimeText: this.getDiffDate(new Date(item.Created_Date), new Date()),
          Created_Date_Text: null
        }, item)
      );
    }
    catch (e) {
      this.showMessage('error', e);
    }
  }

  showListNotification() {
    this.getListNotification();
  }

  getDiffDate(date1: Date, date2: Date) {
    if (date1.getTime() > date2.getTime()) {
      return 'now';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (D > 0) {
      return D + ' days ago';
    }


    let remain1 = diffTime - D * (1000 * 60 * 60 * 24);
    let H: any = Math.floor(remain1 / (1000 * 60 * 60));
    if (H > 0) {
      return H + ' hours ago';
    }

    let remain2 = remain1 - H * (1000 * 60 * 60);
    let M: any = Math.floor(remain2 / (1000 * 60));
    if (M > 0) {
      return M + ' minutes ago';
    }

    let remain3 = remain2 - M * (1000 * 60);
    let S: any = Math.floor(remain3 / 1000);
    if (S >= 0) {
      return 'now';
    }

    return '';
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
      this.getListNotification();
    });
  }

  viewAllNoti() {
    this.router.navigate(['/notification/list'])
  }

  logout() {
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('dashboard');
    this.authService.logout();
  }

  ngOnDestroy() {
    this.query?.unsubscribe();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
