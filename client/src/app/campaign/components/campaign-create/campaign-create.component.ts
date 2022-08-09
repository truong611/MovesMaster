import { EncrDecrService } from './../../../shared/services/encrDecr.service';
import { FormatDateService } from './../../../shared/services/formatDate.services';
import { CampaignService } from './../../services/campaign.service';
import { HandleFileService } from './../../../shared/services/handleFile.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-campaign-create',
  templateUrl: './campaign-create.component.html',
  styleUrls: ['./campaign-create.component.css']
})
export class CampaignCreateComponent implements OnInit {
  objectType: string = null;
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  charity_Name: string = this.user.Charity_Name;
  charity_icon: string = this.user.Charity_icon;
  Moves_Charity_ID: number = this.user.Moves_Charity_ID;
  objectId: number = null;
  submitted: boolean = false;
  submittedConfirm: boolean = false;

  minDate = new Date();

  createForm: FormGroup;
  nameControl: FormControl;
  urlControl: FormControl;
  desControl: FormControl;
  launchDateControl: FormControl;
  endDateControl: FormControl;
  choiceControl: FormControl;
  targetValueControl: FormControl;
  pricePerMoveControl: FormControl;
  appealControl: FormControl;
  companyControl: FormControl;
  publicPrivateControl: FormControl;
  isMatchControl: FormControl;
  // currencyControl: FormControl;

  confirmPass: FormGroup;
  passControl: FormControl;

  defaultLimitedFileSize = 10000000; //10MB
  uploadedFiles = [];
  @ViewChild('currentLogo') currentLogo: ElementRef;
  currentLogoUrl: any = '/assets/img/Default Image.png';
  newLogoUrl: any = null;

  isIcon: boolean = false; // true: campaign icon dùng icon của charity/appeal/company; false: dùng icon upload

  listAppeal: Array<any> = [];
  listCompany: Array<any> = [];
  // listCurrency: Array<any> = [];
  currencySelected = 'GBP'; // GBP: tiền tệ là £, USD: tiền tệ là $, EUR: tiền tệ là €

  displayModal: boolean = false;
  displayPreview: boolean = false;
  previewWidth: string;
  previewHeight: string;
  previewForm: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private validaytorsService: ValidaytorsService,
    private messageService: MessageService,
    private domSanitizer: DomSanitizer,
    private handleFileService: HandleFileService,
    private ref: ChangeDetectorRef,
    private campaignService: CampaignService,
    private formatDateService: FormatDateService,
    private location: Location,
    private dialogService: DialogService,
    private encrDecrService: EncrDecrService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.objectType = this.encrDecrService.get(params['objectType']);
      this.objectId = this.objectType != 'charity' ? Number(this.encrDecrService.get(params['objectId'])) : this.Moves_Charity_ID;
      this.setForm();

      if (this.objectType != 'charity' && this.objectType != 'appeal')
        this.showMessage('error', 'path is incorrect');
      else
        this.getMasterData();
    });
  }

  setForm() {
    this.nameControl = new FormControl(null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]);
    this.urlControl = new FormControl(null, [Validators.maxLength(255), this.validaytorsService.isValidHttpUrl]);
    this.desControl = new FormControl(null);
    this.launchDateControl = new FormControl(null, [Validators.required]);
    this.endDateControl = new FormControl(null, [Validators.required]);
    this.choiceControl = new FormControl('true');
    this.targetValueControl = new FormControl(null);
    this.pricePerMoveControl = new FormControl(null, [Validators.required, Validators.min(0.01)]);
    this.appealControl = new FormControl(null);
    this.companyControl = new FormControl(null, [Validators.required]);
    this.publicPrivateControl = new FormControl(false);
    this.isMatchControl = new FormControl(true);
    // this.currencyControl = new FormControl(null);

    this.createForm = new FormGroup({
      nameControl: this.nameControl,
      urlControl: this.urlControl,
      desControl: this.desControl,
      launchDateControl: this.launchDateControl,
      endDateControl: this.endDateControl,
      choiceControl: this.choiceControl,
      targetValueControl: this.targetValueControl,
      pricePerMoveControl: this.pricePerMoveControl,
      appealControl: this.appealControl,
      companyControl: this.companyControl,
      publicPrivateControl: this.publicPrivateControl,
      isMatchControl: this.isMatchControl,
      // currencyControl: this.currencyControl
    });

    this.passControl = new FormControl(null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]);

    this.confirmPass = new FormGroup({
      passControl: this.passControl
    });
  }

  async getMasterData() {
    this.loading = true;
    let { data, loading }: any = await this.campaignService.getMasterDataCreateCampaign(this.objectId, this.objectType);
    this.loading = loading;

    if (data.getMasterDataCreateCampaign.messageCode != 200) {
      this.showMessage('error', data.getMasterDataCreateCampaign.message);
      return;
    }

    this.listAppeal = data.getMasterDataCreateCampaign.ListAppeal;
    this.listCompany = data.getMasterDataCreateCampaign.ListCompany;
    // this.listCurrency = data.getMasterDataCreateCampaign.ListCurrency;

    if (this.objectType == 'appeal') {
      let appeal = this.listAppeal.find(x => x.Appeal_ID == this.objectId);
      this.appealControl.setValue(appeal);
      this.appealControl.disable();
    }
    // this.currencyControl.setValue(this.listCurrency[0]);
    // this.changeCurrency();
  }

  // changeCurrency() {
  //   let currency = this.currencyControl.value?.Currency_Name;
  //   switch (currency) {
  //     case '£':
  //       this.currencySelected = 'GBP';
  //       break;
  //     case '$':
  //       this.currencySelected = 'USD';
  //       break;
  //     case '€':
  //       this.currencySelected = 'EUR';
  //       break;
  //   }
  // }

  changeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async handleFileUpload(event) {
    if (event.target.files.length > 0) {
      if (event.target.files[0].size > this.defaultLimitedFileSize) {
        this.showMessage('error', 'The size image is too big');
        return;
      }
      this.isIcon = false;
      this.newLogoUrl = await this.changeFile(event.target.files[0]);
      this.ref.detectChanges();
      setTimeout(() => {
        let naturalWidth = this.currentLogo.nativeElement.naturalWidth;
        let naturalHeight = this.currentLogo.nativeElement.naturalHeight;

        // if ((naturalWidth / naturalHeight) != 1) {
        //   this.uploadedFiles = [];
        //   this.showMessage('error', 'Image is incorrect ratio');
        //   return;
        // }

        this.currentLogoUrl = this.newLogoUrl;
        this.uploadedFiles = this.handleFileService.convertFileName(event.target);
      }, 500)
    }
    else {
      this.currentLogoUrl = '/assets/img/Default Image.png';
    }
  }

  uploadImage() {
    document.getElementById('imageProfile').click();
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  selectImage(url) {
    this.isIcon = true;
    this.currentLogoUrl = url;
  }

  changeChoice() {
    if (this.choiceControl.value != 'true') {
      this.targetValueControl.setValidators([Validators.required, Validators.min(0.01)]);
      this.endDateControl.setValidators([]);
    }
    else {
      this.endDateControl.setValidators([Validators.required]);
      this.targetValueControl.setValidators([]);
    }

    this.targetValueControl.updateValueAndValidity();
    this.endDateControl.updateValueAndValidity();
  }

  checkForm() {
    this.submitted = true;
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach(key => {
        if (this.createForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
        }
      });

      return;
    }

    let now = new Date();
    let nowTime = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)).getTime();

    let startTimeCampaign = this.launchDateControl.value;
    startTimeCampaign = (new Date(startTimeCampaign.getFullYear(), startTimeCampaign.getMonth(), startTimeCampaign.getDate(), startTimeCampaign.getHours(), startTimeCampaign.getMinutes(), 0)).getTime();

    let endTimeCampaign = this.endDateControl.value;
    endTimeCampaign = endTimeCampaign ? (new Date(endTimeCampaign.getFullYear(), endTimeCampaign.getMonth(), endTimeCampaign.getDate(), endTimeCampaign.getHours(), endTimeCampaign.getMinutes(), 0)).getTime() : null;

    if (startTimeCampaign <= nowTime) {
      this.showMessage('error', 'Campaign Launch Date must be in the future');
      return;
    }

    if (endTimeCampaign && endTimeCampaign <= startTimeCampaign) {
      this.showMessage('error', 'Campaign End Date must be after Campaign Launch Date');
      return;
    }

    if (this.objectType == 'appeal' || this.appealControl.value) {
      let appeal = this.appealControl.value;
      let startTimeAppeal = appeal.Appeal_Start_Date;
      let endTimeAppeal = appeal.Appeal_End_Date;

      if (startTimeCampaign < startTimeAppeal) {
        this.showMessage('error', 'The Campaign Start Date / Time cannot then be before the Appeal Start Date / Time');
        return;
      }

      if (endTimeCampaign && endTimeCampaign > endTimeAppeal) {
        this.showMessage('error', 'The Campaign End Date / Time cannot be after the Appeal End Date / Time');
        return;
      }
    }

    // this.passControl.setValue(null);
    // this.displayModal = true;

    this.create();
  }

  cancel() {
    this.location.back();
  }

  async create() {
    // this.submittedConfirm = true;
    // if (!this.confirmPass.valid) {
    //   Object.keys(this.confirmPass.controls).forEach(key => {
    //     if (this.confirmPass.controls[key].valid == false) {
    //       this.confirmPass.controls[key].markAsTouched();
    //     }
    //   });

    //   return;
    // }

    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let Campaign_Target_Value = 0;
    if (this.choiceControl.value != 'true') {
      Campaign_Target_Value = this.targetValueControl.value;
    }

    let dataInput = {
      // Password: this.passControl.value.trim(),
      Campaign_Icon: (this.isIcon) ? this.currentLogoUrl : null,
      Campaign_Icon_File: file,
      Campaign_Name: this.nameControl.value.trim(),
      Campaign_URL: this.urlControl.value ? this.urlControl.value.trim() : null,
      Campaign_Description: this.desControl.value ? this.desControl.value.trim() : null,
      Campaign_Launch_Date: this.launchDateControl.value,
      Campaign_End_Date: this.endDateControl.value,
      End_Date_Target: this.choiceControl.value == 'true' ? true : false,
      Campaign_Target_Value: Campaign_Target_Value,
      Campaign_Price_Per_Move: this.pricePerMoveControl.value,
      Public_Private: this.publicPrivateControl.value,
      Is_Match: this.isMatchControl.value,
      Appeal_ID: this.appealControl.value?.Appeal_ID,
      Moves_Company_ID: this.companyControl.value?.Moves_Company_ID,
      Moves_Charity_ID: Number(this.Moves_Charity_ID),
      // Currency_ID: this.currencyControl.value?.Currency_ID
    };

    this.loading = true;
    let { data, loading }: any = await this.campaignService.createCampaign(dataInput);

    if (data.createCampaign.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.createCampaign.message);
      return;
    }

    this.router.navigate(['/campaign/campaign-detail', { id: this.encrDecrService.set(data.createCampaign.Campaign_ID) }]);
  }

  cancelDialog() {
    this.displayModal = false;
    this.submittedConfirm = false;
  }

  preview() {
    let Campaign_Target_Value = 0;
    if (this.choiceControl.value != 'true') {
      Campaign_Target_Value = this.targetValueControl.value;
    }

    let inforCharityAppeal = this.getCharityAppealIcon();
    let inforCompany = this.getCompanyIcon();

    this.previewForm = {
      Campaign_Icon: this.currentLogoUrl,
      Campaign_URL: this.urlControl.value,
      Charity_Appeal_Icon: inforCharityAppeal.icon,
      Charity_Appeal_Url: inforCharityAppeal.url,
      Company_Icon: inforCompany.icon,
      Company_URL: inforCompany.url,
      Name: this.nameControl.value?.trim(),
      Description: this.desControl.value?.trim(),
      Launch_Date: this.launchDateControl.value,
      Amount_Date: this.getDiffDate(this.launchDateControl.value, new Date), //D: H: M: S
      Contract_Target_Amount: Campaign_Target_Value, //Contract line 1
      Contract_Price_Per_Move: this.pricePerMoveControl.value, //Contract line 2
      Contract_Move: this.getContractMove(), //Contract line 3
      Matches: 0,
      Progress_Donations: 0, //Progress line 1
      Progress_Moves: 0, //Progress line 2
      Progress_Amount: 0, //Progress line 3
      Progress_Line4: this.getProgressLine4(), //Progress line 4
    }

    let preview = JSON.parse(localStorage.getItem('preview'));
    this.previewWidth = preview.width;
    this.previewHeight = preview.height;

    this.displayPreview = true;
  }

  getCharityAppealIcon() {
    let inforCharityAppeal = {
      icon: null,
      url: null
    }
    let appeal = this.appealControl.value;

    if (appeal) {
      inforCharityAppeal.icon = appeal.Appeal_Icon ? appeal.Appeal_Icon : '/assets/img/Default Image.png';
      inforCharityAppeal.url = appeal?.Appeal_URL;
      return inforCharityAppeal;
    }

    inforCharityAppeal.icon = this.user.Charity_icon ? this.user.Charity_icon : '/assets/img/Default Image.png';
    inforCharityAppeal.url = this.user.Charity_URL;
    return inforCharityAppeal;
  }

  getCompanyIcon() {
    let inforCompany = {
      icon: null,
      url: null
    }
    let company = this.companyControl.value;

    inforCompany.icon = company?.Company_Icon ? company?.Company_Icon : '/assets/img/Default Image.png';
    inforCompany.url = company?.Company_URL;

    return inforCompany;
  }

  getDiffDate(date1: Date, date2: Date) {
    if (!date1) {
      return '+0: 00: 00: 00';
    }

    if (date1.getTime() > date2.getTime()) {
      return '+0: 00: 00: 00';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let remain1 = diffTime - D * (1000 * 60 * 60 * 24);
    let H: any = Math.floor(remain1 / (1000 * 60 * 60));
    if (H < 10) {
      H = '0' + H;
    }

    let remain2 = remain1 - H * (1000 * 60 * 60);
    let M: any = Math.floor(remain2 / (1000 * 60));
    if (M < 10) {
      M = '0' + M;
    }

    let remain3 = remain2 - M * (1000 * 60);
    let S: any = Math.floor(remain3 / 1000);
    if (S < 10) {
      S = '0' + S;
    }

    return '+' + D + ': ' + H + ': ' + M + ': ' + S;
  }

  getContractMove() {
    if (!this.pricePerMoveControl.value || this.pricePerMoveControl.value == 0) {
      return 0;
    }

    let Campaign_Target_Value = 0;
    //choice target amount
    if (this.choiceControl.value != 'true') {
      Campaign_Target_Value = this.targetValueControl.value;

      return this.roundNumber(Campaign_Target_Value / this.pricePerMoveControl.value, 2);
    }
    //choice end date
    else {
      return 0;
    }
  }

  getProgressLine4() {
    //choice target amount
    if (this.choiceControl.value != 'true') {
      return '0% Funded';
    }
    //choice end date
    else {
      return this.getRemainDay(this.launchDateControl.value, this.endDateControl.value);
    }
  }

  getRemainDay(date1: Date, date2: Date) {
    if (!date1 || !date2) {
      return '0-days Remaining';
    }

    if (date1.getTime() > date2.getTime()) {
      return '0-days Remaining';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return D + '-days Remaining';
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case 0: {
        result = Math.round(number);
        break;
      }
      case 1: {
        result = Math.round(number * 10) / 10;
        break;
      }
      case 2: {
        result = Math.round(number * 100) / 100;
        break;
      }
      case 3: {
        result = Math.round(number * 1000) / 1000;
        break;
      }
      case 4: {
        result = Math.round(number * 10000) / 10000;
        break;
      }
      default: {
        result = result;
        break;
      }
    }
    return result;
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
