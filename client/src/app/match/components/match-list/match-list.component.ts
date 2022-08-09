import { CampaignService } from './../../../campaign/services/campaign.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { MatchService } from './../../services/match.service';
import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { EncrDecrService } from './../../../shared/services/encrDecr.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location, DecimalPipe, DatePipe } from "@angular/common";

import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.css'],
  providers: [DecimalPipe, DatePipe]
})
export class MatchListComponent implements OnInit {
  loading: boolean = false;
  id: number = null;
  type: string = 'campaign';
  colHeader: any = [];
  activeIndex = 0;
  campaign: any = null;
  listMatch: Array<any> = [];
  PercentageDiscount: number = 0;
  totalMatch: number = 0;
  isShowButtonCreate: boolean = false;
  displayModalApprove: boolean = false;
  textApprove: string = null;
  vcb1: boolean = false;
  vcb2: boolean = false;

  submittedConfirm: boolean = false;

  confirmPass: FormGroup;
  passControl: FormControl;

  permissionTypeCode = 'CMC';
  permissionActive: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private matchService: MatchService,
    private encrDecrService: EncrDecrService,
    private messageService: MessageService,
    private validaytorsService: ValidaytorsService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private campaignService: CampaignService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.setForm();

    this.getUserPermission();

    this.route.params.subscribe(params => {
      this.id = Number(this.encrDecrService.get(params['id']));

      if(params['type']) {
        this.type = this.encrDecrService.get(params['type'])
      }

      this.getListMatchByObjectId();
    });

    if(this.type == 'company') {
      this.colHeader = [
        { field: 'Campaign_Icon', header: '', textAlign: 'center', colWith: '15%' },
        { field: 'Campaign_Name', header: 'Campaign', textAlign: 'left', colWith: '50%' },
        { field: 'Match_Date_Created', header: 'Date and time the Match was created', textAlign: 'left', colWith: '35%' },
      ];
    } else {
      this.colHeader = [
        { field: 'Company_Icon', header: '', textAlign: 'center', colWith: '15%' },
        { field: 'Company_Name', header: 'Company', textAlign: 'left', colWith: '50%' },
        { field: 'Match_Date_Created', header: 'Date and time the Match was created', textAlign: 'left', colWith: '35%' },
      ];
    }
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;
      let user_permission = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCode);
      this.permissionActive = user_permission?.Is_Active ?? false;
    }
  }

  setForm() {
    this.passControl = new FormControl(null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]);

    this.confirmPass = new FormGroup({
      passControl: this.passControl
    });
  }

  async getListMatchByObjectId() {
    this.loading = true;
    let { data, loading }: any = await this.matchService.getListMatchByObjectId(this.id, this.type);
    this.loading = loading;

    if (data.getListMatchByObjectId.messageCode != 200) {
      this.showMessage('error', data.getListMatchByObjectId.message);
      return;
    }

    this.campaign = data.getListMatchByObjectId.Campaign;
    this.listMatch = data.getListMatchByObjectId.ListMatch;
    this.totalMatch = this.listMatch.length;
    this.isShowButtonCreate = data.getListMatchByObjectId.IsShowButtonCreate;
    this.PercentageDiscount = data.getListMatchByObjectId.PercentageDiscount;
  }

  back() {
    window.history.go(-1); return false;
  }

  goToDetail() {

  }

  createMatch() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    if (!this.permissionActive) {
      this.showMessage('error', 'You do not have permission to Match Campaigns');
      return;
    }

    this.submittedConfirm = false;
    this.confirmPass.reset();
    this.displayModalApprove = true;
    this.vcb1 = false; 
    this.vcb2 = false;
    
    if (this.campaign.End_Date_Target == false) {
      this.textApprove = 'Confirming this Match means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' £' + this.decimalPipe.transform(this.campaign.Campaign_Target_Value);
    }
    else {
      this.textApprove = 'Confirming this Match means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' an unlimited amount raised between ' + this.datePipe.transform(this.campaign.Campaign_Launch_Date, 'dd/MM/yyyy HH:mm') + 
        ' and ' + this.datePipe.transform(this.campaign.Campaign_End_Date, 'dd/MM/yyyy HH:mm');
    }
  }

  cancelApprove() {
    this.displayModalApprove = false;
  }

  async acceptApprove() {
    this.submittedConfirm = true;
    if (!this.confirmPass.valid) {
      Object.keys(this.confirmPass.controls).forEach(key => {
        if (this.confirmPass.controls[key].valid == false) {
          this.confirmPass.controls[key].markAsTouched();
        }
      });

      return;
    }

    if (this.vcb1 == false || (this.vcb2 == false && this.PercentageDiscount != 0)) {
      return;
    }

    let pass = this.passControl.value.trim();

    this.loading = true;
    let { data, loading }: any = await this.campaignService.approveCampaign(pass, this.id, 'match');

    if (data.approveCampaign.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.approveCampaign.message);
      return;
    }

    this.displayModalApprove = false;
    this.showMessage('success', data.approveCampaign.message);
    this.getListMatchByObjectId();
  }

  goToTemps() {

  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
