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
  selector: 'app-create-appeal',
  templateUrl: './create-appeal.component.html',
  styleUrls: ['./create-appeal.component.css']
})
export class CreateAppealComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  charity_Name: string = null;
  Moves_Charity_ID: number = this.user.Moves_Charity_ID;
  submitted: boolean = false;

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
  charityLogoUrl: any = null;

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

  ngOnInit() {
    this.setForm();
    this.getDetailCharity();
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

  async getDetailCharity() {
    this.loading = true;
    let { data, loading }: any = await this.appealService.getDetailCharity(this.Moves_Charity_ID);
    this.loading = loading;

    if (data.getDetailCharity.messageCode != 200) {
      this.showMessage('error', data.getDetailCharity.message);
      return;
    }

    let charity = data.getDetailCharity.Charity;
    this.charity_Name = charity.Charity_Name;
    this.charityLogoUrl = charity.Charity_icon;
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

  async create() {
    this.submitted = true;
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach(key => {
        if (this.createForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
        }
      });

      return;
    }

    let startDate = (this.startDateControl.value as Date).getTime();
    let endDate = this.endDateControl.value ? (this.endDateControl.value as Date).getTime() : null;

    if (endDate && startDate >= endDate) {
      this.showMessage('error', 'Appeal End Date must be after Appeal Start Date');
      return;
    }

    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;
    // if (!file) {
    //   this.showMessage('error', 'avatar not found');
    //   return;
    // }

    let dataInput = {
      Appeal_Icon_File: file,
      Appeal_Name: this.nameControl.value.trim(),
      Appeal_URL: this.urlControl.value ? this.urlControl.value.trim() : null,
      Appeal_Description: this.desControl.value ? this.desControl.value.trim() : null,
      Appeal_Start_Date: this.startDateControl.value,
      Appeal_End_Date: this.endDateControl.value,
      Appeal_Target_Amount: this.targetAmountControl.value,
      Moves_Charity_ID: this.Moves_Charity_ID,
    };

    this.loading = true;
    let { data, loading }: any = await this.appealService.createAppeal(dataInput);

    if (data.createAppeal.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.createAppeal.message);
      return;
    }

    this.router.navigate(['/appeal/detail-appeal', { id: this.encrDecrService.set(data.createAppeal.Appeal_ID) }]);
  }

  cancel() {
    this.location.back();
  }

  preview() {
    this.previewForm = {
      Icon: this.currentLogoUrl,
      Appeal_URL: this.urlControl.value?.trim(),
      Name: this.nameControl.value?.trim(),
      Status_Name: 'Draft'.toUpperCase(),
      Description: this.desControl.value?.trim(),
      Launch_Date: this.startDateControl.value,
      Amount_Date: this.getDiffDate(this.startDateControl.value, new Date), //D: H: M: S
      Target: this.targetAmountControl.value, //Target
      Amount_Raised: 0,
      TotalCampaign: 0,
      Progress: 0
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

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
