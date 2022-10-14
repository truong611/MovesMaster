import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from "@angular/common";

import { FormatDateService } from './../../../shared/services/formatDate.services';
import { NewsService } from '../../services/news.service';
import { HandleFileService } from './../../../shared/services/handleFile.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

import { CreateNewsInput } from '../../models/news.model';

@Component({
  selector: 'app-create-new',
  templateUrl: './create-new.component.html',
  styleUrls: ['./create-new.component.css']
})
export class CreateNewComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  charity = null;

  formGroup: FormGroup;
  submitted: boolean = false;

  listAppeal: any = [];
  listCompany: any = [];
  listAllCampaign: any = [];
  listCampaign: any = [];

  error: any = {
    News_Title: '',
    News_Url: '',
    News_Content: ''
  }

  defaultLimitedFileSize = 10000000; //10MB
  uploadedFiles = [];
  @ViewChild('currentLogo') currentLogo: ElementRef;
  currentLogoUrl: any = '/assets/img/Default Image.png';
  newLogoUrl: any = null;

  displayPreview: boolean = false;
  previewWidth: string;
  previewHeight: string;
  
  previewForm: any = null;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private validaytorsService: ValidaytorsService,
    private messageService: MessageService,
    private domSanitizer: DomSanitizer,
    private handleFileService: HandleFileService,
    private ref: ChangeDetectorRef,
    private newsService: NewsService,
    private location: Location,
    private encrDecrService: EncrDecrService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getMasterDataCreateNews();
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      News_Title: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      News_Url: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText, this.validaytorsService.isValidHttpUrl]],
      News_Content: [null, [Validators.required]],
      Moves_Company_ID: [null],
      Appeal_ID: [null],
      Campaign_ID: [null]
    });
  }

  async getMasterDataCreateNews() {
    this.loading = true;
    let { data, loading }: any = await this.newsService.getMasterDataCreateNews();
    this.loading = loading;

    if (data.getMasterDataCreateNews.messageCode != 200) {
      this.showMessage('error', data.getMasterDataCreateNews.message);
      return;
    }

    this.charity = data.getMasterDataCreateNews.Charity;
    this.listCompany = data.getMasterDataCreateNews.ListCompany.map((item) =>
      Object.assign({
        Company_Text: item.Company_Number + ' - ' + item.Company_Name
      }, item)
    );
    this.listAppeal = data.getMasterDataCreateNews.ListAppeal;
    this.listAllCampaign = data.getMasterDataCreateNews.ListCampaign;
    this.listCampaign = this.listAllCampaign.filter(x => !x.Appeal_ID);

    this.formGroup.patchValue({News_Url: this.charity?.Charity_URL ?? null})
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
        this.currentLogoUrl = this.newLogoUrl;
        this.uploadedFiles = this.handleFileService.convertFileName(event.target);
      }, 500)
    }
    else {
      this.currentLogoUrl = '/assets/img/Default Image.png';
      this.newLogoUrl = null;
    }
  }

  uploadImage() {
    document.getElementById('imageProfile').click();
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  changeAppeal(event) {
    this.formGroup.patchValue({Campaign_ID : null});
    this.listCampaign = this.listAllCampaign.filter(x => x.Appeal_ID == event.value);
  }

  async create() {
    this.submitted = true;
    if (!this.formGroup.valid) {
      if (this.formGroup.get('News_Url').errors?.required || this.formGroup.get('News_Url').errors?.forbiddenSpaceText) {
        this.error['News_Url'] = 'This field is mandatory';
      } else if (this.formGroup.get('News_Url').errors?.invalidUrl) {
        this.error['News_Url'] = 'Incorrect url format';
      } else if (this.formGroup.get('News_Url').errors?.maxlength) {
        this.error['News_Url'] = 'Maximum 255 characters exceeded';
      }

      if (this.formGroup.get('News_Title').errors?.required || this.formGroup.get('News_Title').errors?.forbiddenSpaceText) {
        this.error['News_Title'] = 'This field is mandatory';
      } else if (this.formGroup.get('News_Title').errors?.maxlength) {
        this.error['News_Title'] = 'Maximum 255 characters exceeded';
      }

      if (this.formGroup.get('News_Content').errors?.required) {
        this.error['News_Content'] = 'This field is mandatory';
      }

      return;
    }

    let formData = this.formGroup.value;
    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let dataInput: CreateNewsInput = {
      News_Title: formData.News_Title.trim(),
      News_Url: formData.News_Url.trim(),
      News_Content: formData.News_Content.trim(),
      Moves_Company_ID: formData.Moves_Company_ID?.Moves_Company_ID ?? null,
      Appeal_ID: formData.Appeal_ID?.Appeal_ID ?? null,
      Campaign_ID: formData.Campaign_ID?.Campaign_ID ?? null,
      News_Image_File: file
    };

    this.loading = true;
    let { data, loading }: any = await this.newsService.createNews(dataInput);

    if (data.createNews.messageCode != 200) {
      this.loading = loading;
      this.showMessage('error', data.createNews.message);
      return;
    }

    this.router.navigate(['/news/detail-new', { id: this.encrDecrService.set(data.createNews.Id) }]);
  }

  cancel() {
    this.location.back();
  }

  preview() {
    let formData = this.formGroup.value;

    this.previewForm = {
      News_Image: this.newLogoUrl,
      News_Title: formData.News_Title?.trim(),
      News_Url: formData.News_Url?.trim(),
      News_Content: formData.News_Content?.trim(),
      Moves_Company_ID: formData.Moves_Company_ID?.Moves_Company_ID,
      Charity_icon: this.charity.Charity_icon,
      Charity_URL: this.charity.Charity_URL,
      Company_Icon: (formData.Moves_Company_ID && formData.Moves_Company_ID.Company_Icon ) ? formData.Moves_Company_ID.Company_Icon : null,
      Company_URL: formData.Moves_Company_ID?.Company_URL,
      Appeal_ID: formData.Appeal_ID?.Appeal_ID,
      Appeal_Icon: (formData.Appeal_ID && formData.Appeal_ID.Appeal_Icon) ? formData.Appeal_ID.Appeal_Icon : null,
      Appeal_URL: formData.Appeal_ID?.Appeal_URL,
      Campaign_ID: formData.Campaign_ID?.Campaign_ID,
      Campaign_Icon: (formData.Campaign_ID && formData.Campaign_ID.Campaign_Icon)? formData.Campaign_ID.Campaign_Icon : null,
      Campaign_URL: formData.Campaign_ID?.Campaign_URL,
    }

    let preview = JSON.parse(localStorage.getItem('preview'));
    this.previewWidth = preview.width;
    this.previewHeight = preview.height;

    this.displayPreview = true;
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
