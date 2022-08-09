import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CompanyService } from '../../services/company.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-popup-listcompany',
  templateUrl: './popup-listcompany.component.html',
  styleUrls: ['./popup-listcompany.component.css']
})
export class PopupListcompanyComponent implements OnInit {
  loading: boolean = false;

  activeIndex: number = 0;

  company: any;
  CharityInfor: any;

  permissionTypeCodeApprove = 'ACO';
  permissionApproveActive: boolean;

  permissionTypeCodeDeny = 'RCO';
  permissionDenyActive: boolean;

  constructor(
    private router: Router,
    public ref: DynamicDialogRef,
    private data: DynamicDialogConfig,
    private companyService: CompanyService,
    private messageService: MessageService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.getUserPermission();
    this.company = this.data.data.company;
    this.CharityInfor = this.data.data.company.CharityInfor;
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;

      let user_permission_approve = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeApprove);
      this.permissionApproveActive = user_permission_approve?.Is_Active ?? false;

      let user_permission_deny = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeDeny);
      this.permissionDenyActive = user_permission_deny?.Is_Active ?? false;
    }
  }

  directoryCompany() {
    this.router.navigate(['/directory', { mode: 1 }]);
    this.ref.close();
  }

  async approve() {
    if (!this.permissionApproveActive) {
      this.showMessage('error', 'You do not have permission to accept company applications');
    } else {
      try {
        this.loading = true;
        let { data, loading }: any = await this.companyService.approveCompany(this.company.Moves_Company_ID);
        this.loading = loading;

        if (data.approveCompany.messageCode != 200) {
          this.showMessage('error', data.approveCompany.message);
          return;
        }

        this.showMessage('success', data.approveCompany.message);
        this.cancel();

      }
      catch (e) {
        this.loading = false;
        this.showMessage('error', e);
      }
    }
  }

  async deny() {
    if (!this.permissionDenyActive) {
      this.showMessage('error', 'You do not have permission to reject company applications');
    } else {
      try {
        this.loading = true;
        let { data, loading }: any = await this.companyService.denyCompany(this.company.Moves_Company_ID);
        this.loading = loading;

        if (data.denyCompany.messageCode != 200) {
          this.showMessage('error', data.denyCompany.message);
          return;
        }

        this.showMessage('success', data.denyCompany.message);
        this.cancel();

      }
      catch (e) {
        this.loading = false;
        this.showMessage('error', e);
      }
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
