import { CampaignService } from './../../../campaign/services/campaign.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { MatchService } from './../../../match/services/match.service';
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

  goToTemps() {
    window.open('/terms-and-conditions', '_blank').focus();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
