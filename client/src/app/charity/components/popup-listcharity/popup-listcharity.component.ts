import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CharityService } from '../../services/charity.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-popup-listcharity',
  templateUrl: './popup-listcharity.component.html',
  styleUrls: ['./popup-listcharity.component.css']
})
export class PopupListcharityComponent implements OnInit {
  loading: boolean = false;

  charity: any;
  checkInfor: string = null;

  checkExistsEmail: boolean = false;
  contact_Name: string = null;
  contact_Phone_Number: string = null;
  contact_Email: string = null;

  permissionTypeCodeApprove = 'AC';
  permissionApproveActive: boolean;

  permissionTypeCodeDeny = 'RC';
  permissionDenyActive: boolean;

  constructor(
    private router: Router,
    public ref: DynamicDialogRef,
    private data: DynamicDialogConfig,
    private charityService: CharityService,
    private messageService: MessageService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.getUserPermission();
    this.charity = this.data.data.charity;

    if(this.charity?.Charity_Type == 1) {
      this.checkExistsEmailByCharityEmail();
    }
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

  async checkExistsEmailByCharityEmail() {
    let { data }: any = await this.charityService.checkExistsEmailByCharityEmail(this.charity.Contact_Email);

    if (data.checkExistsEmailByCharityEmail.messageCode == 200) {
      this.checkExistsEmail = data.checkExistsEmailByCharityEmail.IsExists;

    }
  }

  directoryCompany() {
    this.router.navigate(['/directory']);
    this.ref.close();
  }

  async approve() {
    if (!this.permissionApproveActive) {
      this.showMessage('error', 'You do not have permission to accept charity applications');
    } else {
      try {
        this.loading = true;
        let { data, loading }: any = await this.charityService.approveCharity(this.charity.Moves_Charity_ID);
        this.loading = loading;

        if (data.approveCharity.messageCode != 200) {
          this.showMessage('error', data.approveCharity.message);
          return;
        }

        this.showMessage('success', data.approveCharity.message);
        this.cancel();

      }
      catch (e) {
        this.loading = false;
        this.showMessage('error', e);
      }
    }
  }

  async checkCharityInfor() {
    try {
      this.loading = true;
      let mode = (this.charity.Charity_Type == 0) ? 'name' : 'number';
      let { data, loading }: any = await this.charityService.checkCharityInfor(this.charity.Moves_Charity_ID, mode);
      this.loading = loading;

      if (data.checkCharityInfor.messageCode != 200) {
        this.showMessage('error', data.checkCharityInfor.message);
        return;
      }

      if(data.checkCharityInfor.Url) {
        window.open(data.checkCharityInfor.Url, '_blank').focus();
      }

      this.checkInfor = data.checkCharityInfor.message;

    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  async deny() {
    if (!this.permissionDenyActive) {
      this.showMessage('error', 'You do not have permission to reject charity applications');
    } else {
      try {
        this.loading = true;
        let { data, loading }: any = await this.charityService.denyCharity(this.charity.Moves_Charity_ID);
        this.loading = loading;

        if (data.denyCharity.messageCode != 200) {
          this.showMessage('error', data.denyCharity.message);
          return;
        }

        this.showMessage('success', data.denyCharity.message);
        this.cancel();

      }
      catch (e) {
        this.loading = false;
        this.showMessage('error', e);
      }
    }
  }

  async invite() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.charityService.charityInvitation(this.charity.Moves_Charity_ID);
      this.loading = loading;

      if (data.charityInvitation.messageCode != 200) {
        this.showMessage('error', data.charityInvitation.message);
        return;
      }

      this.showMessage('success', data.charityInvitation.message);

    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
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
