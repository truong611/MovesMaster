import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  loading: boolean = false;
  user: any;

  @Input() formData: any;
  @Input() icon: any;
  @Input() type: number;
  @Input() objectId: number;
  @Input() isMyCharity: boolean;
  @Input() isMyCompany: boolean;

  totalAppeal: number;
  totalCampaign: number;
  totalDonation: number;
  totalCharityActive: number;
  totalCompanyActive: number;
  totalMove: number;
  totalMatchOfCompany: number;

  displayPreview: boolean = false;
  previewWidth: string;
  previewHeight: string;

  permissionTypeCodeAppeal = 'CCAA';
  permissionAppealActive: boolean;

  permissionTypeCodeCampaign = 'CIC';
  permissionCampaignActive: boolean;

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private encrDecrService: EncrDecrService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getUserPermission();
    this.getDashboardReport();
  }

  ngAfterViewInit() {
    let previewWidth = document.getElementById("dashboardReport").offsetWidth + 'px';
    let previewHeight = document.getElementById("dashboardReport").offsetHeight + 'px';

    if (this.isMyCharity || this.isMyCompany) {
      localStorage.setItem('preview', JSON.stringify({ width: previewWidth, height: previewHeight }));
    }

  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.objectId) {
      if (!changes.objectId.firstChange) {
        this.getDashboardReport();
        this.ngAfterViewInit();
      }
    }
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;

      let user_permission_appeal = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeAppeal);
      this.permissionAppealActive = user_permission_appeal?.Is_Active ?? false;

      let user_permission_campaign = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCampaign);
      this.permissionCampaignActive = user_permission_campaign?.Is_Active ?? false;
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
        this.totalCharityActive = data.getDashboardReport.TotalCharityActive;
        this.totalCompanyActive = data.getDashboardReport.TotalCompanyActive;
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

  preview() {
    let preview = JSON.parse(localStorage.getItem('preview'));
    this.previewWidth = preview.width;
    this.previewHeight = preview.height;
    this.displayPreview = true;
  }

  appeals() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    if (!this.permissionAppealActive) {
      this.showMessage('error', 'You do not have permission to create Appeals');
      return;
    }
    this.router.navigate(['/appeal/create-appeal']);
  }

  goToListAppeal() {
    // if (this.isMyCharity) {
    this.router.navigate(['/appeal/list-appeal', { objectId: this.encrDecrService.set(this.objectId) }]);
    // }

  }

  goToListDonation() {
    let objectType = null;
    let objectId = null;

    switch (this.type) {
      case 1:
        //màn hình dashboard với tài khoản là charity
        objectType = 'charity';
        objectId = this.user.Moves_Charity_ID;
        break;
      case 2:
        //màn hình dashboard với tài khoản là company
        objectType = 'company';
        objectId = this.user.Moves_Company_ID;
        break;
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
      this.router.navigate(['/donation/list-donation', { objectType: this.encrDecrService.set(objectType), objectId: this.encrDecrService.set(objectId), type: this.encrDecrService.set(this.type)  }]);
    }
  }

  createCampaign() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }
    if (!this.permissionCampaignActive) {
      this.showMessage('error', 'You do not have permission to initiate Campaigns');
      return;
    }
    this.router.navigate(['/campaign/campaign-create', { objectType: this.encrDecrService.set('charity') }]);
  }

  goToListCampaign() {
    let objectType = this.setObject().objectType;
    let objectId = this.setObject().objectId;

    if (objectType) {
      this.router.navigate(['/campaign/campaign-list', { objectType: this.encrDecrService.set(objectType), objectId: this.encrDecrService.set(objectId) }]);
    }
  }

  goToListMatches() {
    let objectId = this.setObject().objectId;

    // if (this.isMyCompany) {
      this.router.navigate(['/match/match-list', { type: this.encrDecrService.set('company'), id: this.encrDecrService.set(objectId) }]);
    // }
  }

  setObject() {
    let objectType = null;
    let objectId = null;

    switch (this.type) {
      case 1:
        //màn hình dashboard với tài khoản là charity
        objectType = 'a';
        objectId = this.user.Moves_Charity_ID;
        break;
      case 2:
        //màn hình dashboard với tài khoản là company
        objectType = 'b';
        objectId = this.user.Moves_Company_ID;
        break;
      case 4:
        //màn hình charity dashboard với tài khoản khác company
        if (this.user.Type != 2) {
          objectType = 'a';
          objectId = this.objectId;
        }

        //màn hình charity dashboard với tài khoản là company
        if (this.user.Type == 2) {
          objectType = 'd';
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
