import { DashboardService } from './../../../../dashboard/services/dashboard.service';
import { Component, OnInit} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { EncrDecrService } from './../../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-dashboard-profile',
  templateUrl: './dashboard-profile.component.html',
  styleUrls: ['./dashboard-profile.component.css']
})
export class DashboardProfileComponent implements OnInit {
  loading: boolean = false;

  type: number;
  objectId: number;

  charity: any;
  company: any;
  currentLogoUrl: any;

  baseRoute = '/dashboard';
  nextRoute = '';

  activeIndex = 0;
  isView: boolean = false;

  formGroup: FormGroup;

  listGeographicalScope = [];
  listIncomeBand = [];
  listCharitySector = [];

  colHeader = [];
  List_Action_History = [];

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['objectId']) {
        this.objectId = Number(this.encrDecrService.get(params['objectId']));
      }

      if (params['type']) {
        this.type = Number(this.encrDecrService.get(params['type']));
      }

      this.initForm();
      this.getDashboardProfile();
    });
  }

  async getDashboardProfile() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardProfile(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardProfile.messageCode == 200) {
        this.charity = data.getDashboardProfile.Charity;
        this.company = data.getDashboardProfile.Company;

        if (this.type == 4) {
          this.currentLogoUrl = this.charity.Charity_icon ? this.charity.Charity_icon : '/assets/img/Default Image.png'
        }

        if (this.type == 5) {
          this.currentLogoUrl = this.company.Company_Icon ? this.company.Company_Icon : '/assets/img/Default Image.png'
        }

        this.listGeographicalScope = data.getDashboardProfile.List_Geographical_Scope;
        this.listIncomeBand = data.getDashboardProfile.List_Income_Band;
        this.listCharitySector = data.getDashboardProfile.List_Sector;
        this.List_Action_History = data.getDashboardProfile.List_Action_History.map((item) =>
          Object.assign({
            User_Name: (item.Forename ? item.Forename : '') + ' ' + (item.Surname ? item.Surname : '')
          }, item)
        );

        this.setForm();

      }
      else {
        this.showMessage('error', data.getDashboardProfile.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  initForm() {
    if (this.type == 4) {
      this.formGroup = this.formBuilder.group({
        Charity_Name: [{ value: null, disabled: true }],
        Charity_Commission_No: [{ value: null, disabled: true }],
        Moves_Charity_ID: [{ value: null, disabled: true }],
        Charity_URL: [null],
        Contact_Name: [null],
        Contact_Email: [null],
        Contact_Phone_Number: [null],
        Charity_Date_Founded: [null],
        Charity_Aims: [null],
        Charity_Geographical_Scope: [null],
        Charity_Income_Band_ID: [null],
        Charity_Sector: [null],
        Date_Active: [null],
        Address_For_Invoice: [null],
        Payment_Site_Url: [null],
        Account_Name: [null],
        Account_No: [null],
        Sort_Code: [null],
        Member_Payment_Site_Url: [null],
        Member_Account_Name: [null],
        Member_Account_No: [null],
        Member_Sort_Code: [null]
      });
    }

    if (this.type == 5) {
      this.formGroup = this.formBuilder.group({
        Company_Name: [{ value: null, disabled: true }],
        Company_Number: [{ value: null, disabled: true }],
        Moves_Company_ID: [{ value: null, disabled: true }],
        Company_URL: [null],
        Contact_Name: [null],
        Contact_Email: [null],
        Contact_Phone_Number: [null],
        Company_CSR_Statement: [null],
        Date_Active: [null],
      });
    }
  }

  setForm() {
    let Geographical_Scope = this.listGeographicalScope.find(x => x.Category_ID == this.charity?.Charity_Geographical_Scope) ?? null;
    let Income_Band = this.listIncomeBand.find(x => x.Category_ID == this.charity?.Charity_Income_Band_ID) ?? null;

    if (this.type == 4) {
      this.formGroup.setValue({
        Charity_Name: this.charity?.Charity_Name ?? null,
        Charity_Commission_No: this.charity?.Charity_Commission_No ?? null,
        Moves_Charity_ID: this.charity?.Moves_Charity_ID ?? null,
        Charity_URL: this.charity?.Charity_URL ?? null,
        Contact_Name: this.charity?.Contact_Name ?? null,
        Contact_Email: this.charity?.Contact_Email ?? null,
        Contact_Phone_Number: this.charity?.Contact_Phone_Number ?? null,
        Charity_Date_Founded: this.charity?.Charity_Date_Founded ? new Date(this.charity?.Charity_Date_Founded) : null,
        Charity_Aims: this.charity?.Charity_Aims ?? null,
        Charity_Geographical_Scope: Geographical_Scope,
        Charity_Income_Band_ID: Income_Band,
        Charity_Sector: this.listCharitySector.filter(x => this.charity?.List_Charity_Sector_ID.includes(x.Category_ID)),
        Date_Active: this.charity?.Date_Active,
        Address_For_Invoice: this.charity?.Address_For_Invoice ?? null,
        Payment_Site_Url: this.charity?.Payment_Site_Url ?? null,
        Account_Name: this.charity?.Account_Name ?? null,
        Account_No: this.charity?.Account_No ?? null,
        Sort_Code: this.charity?.Sort_Code ?? null,
        Member_Payment_Site_Url: this.charity?.Member_Payment_Site_Url ?? null,
        Member_Account_Name: this.charity?.Member_Account_Name ?? null,
        Member_Account_No: this.charity?.Member_Account_No ?? null,
        Member_Sort_Code: this.charity?.Member_Sort_Code ?? null
      });
    }

    if (this.type == 5) {
      this.formGroup.setValue({
        Company_Name: this.company?.Company_Name,
        Company_Number: this.company?.Company_Number,
        Moves_Company_ID: this.company?.Moves_Company_ID,
        Company_URL: this.company?.Company_URL,
        Contact_Name: this.company?.Contact_Name,
        Contact_Email: this.company?.Contact_Email,
        Contact_Phone_Number: this.company?.Contact_Phone_Number,
        Company_CSR_Statement: this.company?.Company_CSR_Statement,
        Date_Active: this.company?.Date_Active,
      });
    }

    this.formGroup.disable();
  }

  viewProfile() {
    this.isView = true;
  }

  back() {
    this.isView = false;
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
