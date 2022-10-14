import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { DashboardService } from './../../../../dashboard/services/dashboard.service';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-dashboard-reports',
  templateUrl: './dashboard-reports.component.html',
  styleUrls: ['./dashboard-reports.component.css']
})
export class DashboardReportsComponent implements OnInit {
  loading: boolean = false;
  user: any;

  @Input() type: number;
  @Input() objectId: number;

  totalAppeal: number;
  totalCampaign: number;
  totalDonation: number;
  totalMove: number;
  totalMatchOfCompany: number;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private encrDecrService: EncrDecrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getDashboardReport();
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.objectId) {
      if (!changes.objectId.firstChange) this.getDashboardReport();
    }
  }

  async getDashboardReport() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardReport(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardReport.messageCode == 200) {
        this.totalAppeal = data.getDashboardReport.TotalAppeal;
        this.totalCampaign = data.getDashboardReport.TotalCampaign;
        this.totalDonation = data.getDashboardReport.TotalDonation;
        this.totalMove = data.getDashboardReport.TotalMove;
        this.totalMatchOfCompany = data.getDashboardReport.TotalMatchOfCompany;
      }
      else {
        this.showMessage('error', data.getDashboardReport.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  goToListAppeal() {
    this.router.navigate(['/home-list-appeal', { objectId: this.encrDecrService.set(this.objectId) }]);
  }

  goToListDonation() {
    let objectType = null;
    let objectId = null;

    switch (this.type) {
      case 4:
        //màn hình charity dashboard với tất cả tài khoản
        objectType = 'charity';
        objectId = this.objectId;
        break;
      case 5:
        //màn hình company dashboard với tất cả tài khoản
        objectType = 'company';
        objectId = this.objectId;
        break;
      default:
        break;
    }

    if (objectType) {
      this.router.navigate(['/home-list-donation', { objectType: this.encrDecrService.set(objectType), objectId: this.encrDecrService.set(objectId), type: this.encrDecrService.set(this.type) }]);
    }
  }

  goToListCampaign() {
    let objectType = this.setObject().objectType;
    let objectId = this.setObject().objectId;

    if (objectType) {
      this.router.navigate(['/home-list-campaign', { objectType: this.encrDecrService.set(objectType), objectId: this.encrDecrService.set(objectId) }]);
    }

  }

  goToListMatches() {
    let objectId = this.setObject().objectId;

    this.router.navigate(['/home-list-match', { type: this.encrDecrService.set('company'), id: this.encrDecrService.set(objectId) }]);
  }

  setObject() {
    let objectType = null;
    let objectId = null;

    switch (this.type) {
      case 4:
        //màn hình charity dashboard với tài khoản là company
        if (this.user?.Type == 2) {
          objectType = 'd';
          objectId = this.objectId;
        } else {
          //màn hình charity dashboard với tài khoản khác company
          objectType = 'a';
          objectId = this.objectId;
        }

        break;
      case 5:
        //màn hình company dashboard với tất cả tài khoản
        // if(this.user.Type == 2) {
        objectType = 'b';
        objectId = this.objectId;
        // }
        break;
    }

    return {
      objectType,
      objectId
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
