import { Appeal } from './../../model/appeal.model';
import { FormatDateService } from './../../../shared/services/formatDate.services';
import { AppealService } from './../../services/appeal.service';
import { HandleFileService } from './../../../shared/services/handleFile.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-detail-appeal',
  templateUrl: './detail-appeal.component.html',
  styleUrls: ['./detail-appeal.component.css']
})
export class DetailAppealComponent implements OnInit {
  id: number = null;
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  submitted: boolean = false;
  isEdit: boolean = false;

  minDate = new Date((new Date()).getTime() + (1000 * 60 * 60 * 24));

  createForm: FormGroup;
  nameControl: FormControl;
  urlControl: FormControl;
  desControl: FormControl;
  startDateControl: FormControl;
  endDateControl: FormControl;
  targetAmountControl: FormControl;

  defaultLimitedFileSize = 10000000; //10MB
  uploadedFiles = [];
  @ViewChild('currentLogo') currentLogo: ElementRef;
  currentLogoUrl: any = '/assets/img/Default Image.png';
  newLogoUrl: any = null;
  charityLogoUrl: any = '/assets/img/Default Image.png';

  appeal = new Appeal();
  percent: number = 0;

  isShowButtonCreateCampaign: boolean = false;
  isShowButtonEdit: boolean = false;
  isShowButtonPublish: boolean = false;
  isShowButtonAbandon: boolean = false;

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
    private appealService: AppealService,
    private formatDateService: FormatDateService,
    private location: Location,
    private dialogService: DialogService,
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = Number(this.encrDecrService.get(params['id']));
      this.setForm();
      this.getMasterData();
    });
  }

  setForm() {
    this.nameControl = new FormControl(null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]);
    this.urlControl = new FormControl(null, [Validators.maxLength(255), this.validaytorsService.isValidHttpUrl]);
    this.desControl = new FormControl(null);
    this.startDateControl = new FormControl(null, [Validators.required]);
    this.endDateControl = new FormControl(null);
    this.targetAmountControl = new FormControl(null, [Validators.required, Validators.min(0.01)]);

    this.createForm = new FormGroup({
      nameControl: this.nameControl,
      urlControl: this.urlControl,
      desControl: this.desControl,
      startDateControl: this.startDateControl,
      endDateControl: this.endDateControl,
      targetAmountControl: this.targetAmountControl
    });
  }

  async getMasterData() {
    this.loading = true;
    let { data, loading }: any = await this.appealService.getDetailAppeal(this.id);
    this.loading = loading;

    if (data.getDetailAppeal.messageCode != 200) {
      this.showMessage('error', data.getDetailAppeal.message);
      return;
    }

    this.appeal = data.getDetailAppeal.Appeal;
    this.isShowButtonCreateCampaign = data.getDetailAppeal.isShowButtonCreateCampaign;;
    this.isShowButtonEdit = data.getDetailAppeal.isShowButtonEdit;;
    this.isShowButtonPublish = data.getDetailAppeal.isShowButtonPublish;;
    this.isShowButtonAbandon = data.getDetailAppeal.isShowButtonAbandon;;
    
    this.setDefaulValueForm();
  }

  setDefaulValueForm() {
    this.currentLogoUrl = this.appeal.Appeal_Icon ? this.appeal.Appeal_Icon : '/assets/img/Default Image.png';
    this.charityLogoUrl = this.appeal.Charity_icon ? this.appeal.Charity_icon : '/assets/img/Default Image.png';
    this.percent = this.roundNumber((this.appeal.Amount_Raised / this.appeal.Appeal_Target_Amount) * 100, 2);
    this.nameControl.setValue(this.appeal.Appeal_Name);
    this.urlControl.setValue(this.appeal.Appeal_URL);
    this.desControl.setValue(this.appeal.Appeal_Description);
    this.startDateControl.setValue(new Date(this.appeal.Appeal_Start_Date));
    this.endDateControl.setValue(this.appeal.Appeal_End_Date ? new Date(this.appeal.Appeal_End_Date) : null);
    this.targetAmountControl.setValue(this.appeal.Appeal_Target_Amount);

    this.createForm.disable();
  }

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

  async switchMode() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }
    
    this.isEdit = !this.isEdit;

    if (this.isEdit) {
      this.createForm.enable();

      //if status is LIVE
      if (this.appeal.Appeal_Status_ID == 16) {
        this.startDateControl.disable();
      }
    }
    else {
      this.getMasterData();
    }
  }

  async publish() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    this.loading = true;
    let { data, loading }: any = await this.appealService.publishAppeal(this.appeal.Appeal_ID);

    if (data.publishAppeal.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.publishAppeal.message);
      return;
    }

    this.showMessage('success', data.publishAppeal.message);
    this.getMasterData();
  }

  async abandon() {
    this.loading = true;
    let { data, loading }: any = await this.appealService.abandonAppeal(this.appeal.Appeal_ID);

    if (data.abandonAppeal.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.abandonAppeal.message);
      return;
    }

    this.showMessage('success', data.abandonAppeal.message);
    this.getMasterData();
  }

  async save() {
    this.submitted = true;
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach(key => {
        if (this.createForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
        }
      });

      return;
    }

    let now = (new Date()).getTime();
    let startDate = (this.startDateControl.value as Date).getTime();
    let endDate = this.endDateControl.value ? (this.endDateControl.value as Date).getTime() : null;

    if (startDate <= now ) {
      this.showMessage('error', 'Appeal Start Date must be in the future');
      return;
    }

    if (endDate && startDate >= endDate) {
      this.showMessage('error', 'Appeal End Date must be after Appeal Start Date');
      return;
    }

    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let dataInput = {
      Appeal_ID: this.appeal.Appeal_ID,
      Appeal_Icon_File: file,
      Appeal_Name: this.nameControl.value.trim(),
      Appeal_URL: this.urlControl.value.trim(),
      Appeal_Description: this.desControl.value.trim(),
      Appeal_Start_Date: this.startDateControl.value,
      Appeal_End_Date: this.endDateControl.value,
      Appeal_Target_Amount: this.targetAmountControl.value,
    };

    this.loading = true;
    let { data, loading }: any = await this.appealService.updateAppeal(dataInput);

    if (data.updateAppeal.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.updateAppeal.message);
      return;
    }

    this.submitted = false;
    this.isEdit = false;
    this.showMessage('success', data.updateAppeal.message);
    this.getMasterData();
  }

  preview() {
    this.previewForm = {
      Icon: this.currentLogoUrl,
      Appeal_URL: this.urlControl.value?.trim(),
      Name: this.nameControl.value?.trim(),
      Status_Name: this.appeal.Appeal_Status_Name.toUpperCase(),
      Description: this.desControl.value?.trim(),
      Launch_Date: this.startDateControl.value, 
      Amount_Date: this.getDiffDate(this.startDateControl.value, new Date), //D: H: M: S
      Target: this.targetAmountControl.value, //Target
      Amount_Raised: this.appeal.Amount_Raised,
      TotalCampaign: this.appeal.TotalCampaign,
      Progress: this.percent
    }

    let preview = JSON.parse(localStorage.getItem('preview'));
    this.previewWidth = preview.width;
    this.previewHeight = preview.height;

    this.displayPreview = true;
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

  createCampaign() {
    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    this.router.navigate(['/campaign/campaign-create', { objectType: this.encrDecrService.set('appeal'), objectId: this.encrDecrService.set(this.appeal.Appeal_ID) }]);
  }

  goToListCampaign() {
    this.router.navigate(['/campaign/campaign-list', {objectType: this.encrDecrService.set('c'), objectId: this.encrDecrService.set(this.appeal.Appeal_ID) }])
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

  goToListDonation() {
    this.router.navigate(['/donation/list-donation', { objectType: this.encrDecrService.set('appeal'), objectId: this.encrDecrService.set(this.id) }]);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
