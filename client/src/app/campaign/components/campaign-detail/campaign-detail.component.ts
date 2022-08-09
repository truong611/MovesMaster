import { FormatDateService } from './../../../shared/services/formatDate.services';
import { CampaignService } from './../../services/campaign.service';
import { HandleFileService } from './../../../shared/services/handleFile.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { Location, DecimalPipe, DatePipe } from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { EncrDecrService } from './../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  providers: [DecimalPipe, DatePipe]
})
export class CampaignDetailComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  charity_Name: string = this.user.Charity_Name;
  submitted: boolean = false;
  submittedConfirm: boolean = false;
  id: number = null;
  isEdit: boolean = false;

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

  campaign: any = null;
  listAppeal: Array<any> = [];
  listCompany: Array<any> = [];
  // listCurrency: Array<any> = [];
  currencySelected = 'GBP'; // GBP: tiền tệ là £, USD: tiền tệ là $, EUR: tiền tệ là €
  isShowButtonEdit: boolean = false;
  isShowButtonPublish: boolean = false;
  isShowButtonApprove: boolean = false;
  isShowButtonDecline: boolean = false;
  isShowButtonCreateMatch: boolean = false;
  PercentageDiscount: number = 0;

  displayModal: boolean = false;
  displayModalApprove: boolean = false;
  modeApprove: string = null;
  textApprove: string = '';
  vcb1: boolean = false;
  vcb2: boolean = false;

  isPublishClick: boolean = false; 

  displayPreview: boolean = false;
  previewWidth: string;
  previewHeight: string;
  previewForm: any = null;

  permissionTypeCodeMatch = 'CMC';
  permissionMatchActive: boolean;

  permissionTypeCodeApprove = 'CAC';
  permissionApproveActive: boolean;

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
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = Number(this.encrDecrService.get(params['id']));
      this.getUserPermission();
      this.setForm();
      this.getMasterData();
    });
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;

      let user_permission_match = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeMatch);
      this.permissionMatchActive = user_permission_match?.Is_Active ?? false;

      let user_permission_approve = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeApprove);
      this.permissionApproveActive = user_permission_approve?.Is_Active ?? false;
    }
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

    this.createForm.disable();

    this.passControl = new FormControl(null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]);

    this.confirmPass = new FormGroup({
      passControl: this.passControl
    });
  }

  async getMasterData() {
    this.loading = true;
    let { data, loading }: any = await this.campaignService.getDetailCampaign(this.id);
    this.loading = loading;

    if (data.getDetailCampaign.messageCode != 200) {
      this.showMessage('error', data.getDetailCampaign.message);
      return;
    }

    this.campaign = data.getDetailCampaign.Campaign;
    this.listAppeal = data.getDetailCampaign.ListAppeal;
    this.listCompany = data.getDetailCampaign.ListCompany;
    // this.listCurrency = data.getDetailCampaign.ListCurrency;
    this.isShowButtonEdit = data.getDetailCampaign.IsShowButtonEdit;
    this.isShowButtonPublish = data.getDetailCampaign.IsShowButtonPublish;
    this.isShowButtonApprove = data.getDetailCampaign.IsShowButtonApprove;
    this.isShowButtonDecline = data.getDetailCampaign.IsShowButtonDecline;
    this.isShowButtonCreateMatch = data.getDetailCampaign.IsShowButtonCreateMatch;
    this.PercentageDiscount = data.getDetailCampaign.PercentageDiscount;

    this.setDefaulValueForm();
  }

  setDefaulValueForm() {
    this.currentLogoUrl = this.campaign.Campaign_Icon ? this.campaign.Campaign_Icon : '/assets/img/Default Image.png';
    this.nameControl.setValue(this.campaign.Campaign_Name);
    this.urlControl.setValue(this.campaign.Campaign_URL);
    this.desControl.setValue(this.campaign.Campaign_Description);
    this.launchDateControl.setValue(new Date(this.campaign.Campaign_Launch_Date));
    this.endDateControl.setValue(this.campaign.Campaign_End_Date ? new Date(this.campaign.Campaign_End_Date) : null);
    this.choiceControl.setValue(this.campaign.End_Date_Target.toString());
    this.targetValueControl.setValue(this.campaign.Campaign_Target_Value);
    this.pricePerMoveControl.setValue(this.campaign.Campaign_Price_Per_Move);

    let appeal = this.listAppeal.find(x => x.Appeal_ID == this.campaign.Appeal_ID);
    this.appealControl.setValue(appeal);

    let company = this.listCompany.find(x => x.Moves_Company_ID == this.campaign.Moves_Company_ID);
    this.companyControl.setValue(company);

    this.publicPrivateControl.setValue(this.campaign.Public_Private);
    this.isMatchControl.setValue(this.campaign.Is_Match);

    // let currency = this.listCurrency.find(x => x.Currency_ID == this.campaign.Currency_ID);
    // this.currencyControl.setValue(currency);

    this.changeChoice();
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

  selectImage(url) {
    this.isIcon = true;
    this.currentLogoUrl = url;
  }

  editDetail() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    this.isEdit = true;
    this.createForm.enable();
  }

  cancelEditDetail() {
    this.isEdit = false;
    this.createForm.disable();
    this.getMasterData();
  }

  async publish() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    this.isPublishClick = true;

    this.passControl.setValue(null);
    this.confirmPass.reset();
    this.displayModal = true;
  }

  approve(mode: string) {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }
    
    if (!this.permissionApproveActive && mode == 'campaign') {
      this.showMessage('error', 'You do not have permission to authorise Campaigns');
      return;
    }


    if (!this.permissionMatchActive && mode == 'match') {
      this.showMessage('error', 'You do not have permission to Match Campaigns');
      return;
    }

    this.modeApprove = mode;
    this.submittedConfirm = false;
    this.passControl.setValue(null);
    this.confirmPass.reset();
    this.displayModalApprove = true;
    this.vcb1 = false; 
    this.vcb2 = false;
    
    if (this.campaign.End_Date_Target == false) {
      if(mode == 'match') {
        this.textApprove = 'Confirming this Match means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' £' + this.decimalPipe.transform(this.campaign.Campaign_Target_Value);
      } else {
        this.textApprove = 'Approving this Campaign means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' £' + this.decimalPipe.transform(this.campaign.Campaign_Target_Value);
      }
      
    }
    else {
      if(mode == 'match') {
        this.textApprove = 'Confirming this Match means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' an unlimited amount raised between ' + this.datePipe.transform(this.campaign.Campaign_Launch_Date, 'dd/MM/yyyy HH:mm') + 
        ' and ' + this.datePipe.transform(this.campaign.Campaign_End_Date, 'dd/MM/yyyy HH:mm');
      } else {
        this.textApprove = 'Approving this Campaign means you are agreeing to pay ' + 
        this.campaign?.Charity_Name + ' an unlimited amount raised between ' + this.datePipe.transform(this.campaign.Campaign_Launch_Date, 'dd/MM/yyyy HH:mm') + 
        ' and ' + this.datePipe.transform(this.campaign.Campaign_End_Date, 'dd/MM/yyyy HH:mm');
      }
      
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
    let { data, loading }: any = await this.campaignService.approveCampaign(pass, this.id, this.modeApprove);

    if (data.approveCampaign.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.approveCampaign.message);
      return;
    }

    this.displayModalApprove = false;
    this.showMessage('success', data.approveCampaign.message);
    this.getMasterData();
  }

  async decline() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    if (!this.permissionApproveActive) {
      this.showMessage('error', 'You do not have permission to authorise Campaigns');
      return;
    }
    
    this.loading = true;
    let { data, loading }: any = await this.campaignService.declineCampaign(this.id);

    if (data.declineCampaign.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.declineCampaign.message);
      return;
    }

    this.showMessage('success', data.declineCampaign.message);
    this.getMasterData();
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

    if (this.appealControl.value) {
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

    this.passControl.setValue(null);
    this.confirmPass.reset();
    this.displayModal = true;
  }

  async save() {
    this.submittedConfirm = true;
    if (!this.confirmPass.valid) {
      Object.keys(this.confirmPass.controls).forEach(key => {
        if (this.confirmPass.controls[key].valid == false) {
          this.confirmPass.controls[key].markAsTouched();
        }
      });

      return;
    }
    
    if(this.isPublishClick) {
      //publish campaign
      this.loading = true;
      let { data, loading }: any = await this.campaignService.publishCampaign(this.passControl.value.trim(), this.id);
  
      if (data.publishCampaign.messageCode != 200) {
        this.loading = loading;
        this.showMessage('error', data.publishCampaign.message);
        return;
      }
  
      this.showMessage('success', data.publishCampaign.message);
    } else {
      //save form edit campaign
      let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

      let Campaign_Target_Value = 0;
      if (this.choiceControl.value != 'true') {
        Campaign_Target_Value = this.targetValueControl.value;
      }
  
      let dataInput = {
        Password: this.passControl.value.trim(),
        Campaign_ID: this.id,
        Campaign_Icon: (this.isIcon) ? this.currentLogoUrl : this.campaign.Campaign_Icon,
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
        Moves_Company_ID: this.companyControl.value.Moves_Company_ID,
        // Currency_ID: this.currencyControl.value?.Currency_ID
      };
  
      this.loading = true;
      let { data, loading }: any = await this.campaignService.updateCampaign(dataInput);
  
      if (data.updateCampaign.messageCode != 200) {
        this.loading = loading;
        this.showMessage('error', data.updateCampaign.message);
        return;
      }

      this.showMessage('success', data.updateCampaign.message);
      this.isEdit = false;
      this.createForm.disable();
    }
    
    this.submittedConfirm = false;
    this.passControl.setValue(null);
    this.confirmPass.reset();
    this.displayModal = false;
    this.getMasterData();
  }

  cancelDialog() {
    this.displayModal = false;
    this.submittedConfirm = false;
  }

  goToListMatch() {
    this.router.navigate(['/match/match-list', { id: this.encrDecrService.set(this.id) }])
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
      Matches: this.campaign?.Number_Matches ?? 0,
      Progress_Donations: this.campaign?.Progress_Donations ?? 0, //Progress line 1
      Progress_Moves: this.campaign?.Progress_Moves ?? 0, //Progress line 2
      Progress_Amount: this.campaign?.Amount_Raised ?? 0, //Progress line 3
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
    
    inforCharityAppeal.icon = this.campaign?.Charity_icon ? this.campaign?.Charity_icon : '/assets/img/Default Image.png';
    inforCharityAppeal.url = this.campaign?.Charity_URL;
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

  getDiffDateToDays(date1: Date, date2: Date) {
    let current = new Date();

    if (!date2) return null;

    //Status = Complete
    if (this.campaign?.Campaign_Status_ID == 24) {
      return 0;
    }

    current.setSeconds(0);
    current.setMilliseconds(0);

    date1.setSeconds(0);
    date1.setMilliseconds(0);

    date2.setSeconds(0);
    date2.setMilliseconds(0);

    //Status = Live
    if (this.campaign?.Campaign_Status_ID == 23) {
      if (date2.getTime() >= current.getTime()) {
        let diffTime = Math.abs(+date2 - +current); //milliseconds

        let D = this.roundNumber(diffTime / (1000 * 60 * 60 * 24), 1);

        return D;
      }
      else {
        return 0;
      }
    }

    if (date2.getTime() < date1.getTime()) { 
      return 0;
    }
    
    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = this.roundNumber(diffTime / (1000 * 60 * 60 * 24), 1);

    return D;
  }

  getDiffDate(date1: Date, date2: Date) {
    if (date1.getTime() > date2.getTime()) {
      return '+0: 00: 00: 00';
    }
    
    if (!date1) {
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
      if (this.targetValueControl?.value != 0) {
        let _percent = (this.campaign?.Sterling_Amount / this.targetValueControl?.value) * 100;
        let percent = this.roundNumber(_percent, 0);
        return percent + '% Funded';
      }
      
      return '0% Funded';
    }
    //choice end date
    else {
      return this.getRemainDay(this.launchDateControl.value, this.endDateControl.value);
    }
  }

  getRemainDay(date1: Date, date2: Date) {
    if (date1.getTime() > date2.getTime()) {
      return '0-days Remaining';
    }
    
    if (!date1 || !date2) {
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

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goToTemps() {

  }

  goToListDonation() {
    this.router.navigate(['/donation/list-donation', { objectType: this.encrDecrService.set('campaign'), objectId: this.encrDecrService.set(this.id) }]);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
