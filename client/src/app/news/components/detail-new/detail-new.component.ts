import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from "@angular/common";
import { ActivatedRoute } from '@angular/router';

import { NewsService } from '../../services/news.service';
import { HandleFileService } from './../../../shared/services/handleFile.service';
import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

import { CreateNewsInput } from '../../models/news.model';

@Component({
  selector: 'app-detail-new',
  templateUrl: './detail-new.component.html',
  styleUrls: ['./detail-new.component.css']
})
export class DetailNewComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  id: number = null;
  news = null;
  isEdit: boolean = false;

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

  permissionTypeCode = 'CPN';
  permissionActive: boolean;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private validaytorsService: ValidaytorsService,
    private messageService: MessageService,
    private domSanitizer: DomSanitizer,
    private handleFileService: HandleFileService,
    private ref: ChangeDetectorRef,
    private newsService: NewsService,
    private location: Location,
    private encrDecrService: EncrDecrService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = Number(this.encrDecrService.get(params['id']));
      this.getUserPermission();
      this.initForm();
      this.getDetailNews();
    });
  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;
      let user_permission = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCode);
      this.permissionActive = user_permission?.Is_Active ?? false;
    }
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

  async getDetailNews() {
    this.loading = true;
    let { data, loading }: any = await this.newsService.getDetailNews(this.id);
    this.loading = loading;

    if (data.getDetailNews.messageCode != 200) {
      this.showMessage('error', data.getDetailNews.message);
      return;
    }

    this.news = data.getDetailNews.News;

    if (this.news.News_Image) {
      this.currentLogoUrl = this.news.News_Image;
      this.newLogoUrl = this.news.News_Image;
    }

    this.listCompany = data.getDetailNews.ListCompany.map((item) =>
      Object.assign({
        Company_Text: item.Company_Number + ' - ' + item.Company_Name
      }, item)
    );
    this.listAppeal = data.getDetailNews.ListAppeal;
    this.listAllCampaign = data.getDetailNews.ListCampaign;

    if (this.news.Appeal_ID) {
      this.listCampaign = this.listAllCampaign.filter(x => x.Appeal_ID == this.news.Appeal_ID);
    } else {
      this.listCampaign = this.listAllCampaign.filter(x => !x.Appeal_ID);
    }

    this.setForm(this.news);
  }

  setForm(news) {
    let campaign = null;
    if (news.Campaign_ID) {
      campaign = this.listCampaign.find(x => x.Campaign_ID == news.Campaign_ID) ?? null;
    }
    this.formGroup.setValue({
      News_Title: news?.News_Title ?? null,
      News_Url: news?.News_Url ?? null,
      News_Content: news?.News_Content ?? null,
      Moves_Company_ID: news.Moves_Company_ID ? this.listCompany.find(x => x.Moves_Company_ID == news.Moves_Company_ID) : null,
      Appeal_ID: news.Appeal_ID ? this.listAppeal.find(x => x.Appeal_ID == news.Appeal_ID) : null,
      Campaign_ID: campaign,
    });

    this.formGroup.disable();
  }

  edit() {
    this.isEdit = true;
    this.formGroup.enable();
  }

  async updateStatusNews(StatusId) {
    //đổi trạng thái News sang StatusId: 26 - Live | 27 - Withdrawn

    let user = JSON.parse(localStorage.getItem('user'));
    if (user?.Is_Remove_Privileges && StatusId == 26) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    if (!this.permissionActive && StatusId == 26) {
      this.showMessage('error', 'You do not have permission to publish News');
      return;
    }

    this.loading = true;
    let { data, loading }: any = await this.newsService.updateStatusNews(this.id, StatusId);
    this.loading = loading;

    if (data.updateStatusNews.messageCode != 200) {
      this.showMessage('error', data.updateStatusNews.message);
      return;
    }

    this.getDetailNews();
    this.showMessage('success', data.updateStatusNews.message);


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
    this.formGroup.patchValue({ Campaign_ID: null });
    this.listCampaign = this.listAllCampaign.filter(x => x.Appeal_ID == event.value);
  }

  async save() {
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
    let { data, loading }: any = await this.newsService.updateNews(this.id, dataInput);
    this.loading = loading;

    if (data.updateNews.messageCode != 200) {
      this.showMessage('error', data.updateNews.message);
      return;
    }

    this.isEdit = false;
    this.formGroup.disable();
    this.getDetailNews();
    this.showMessage('success', data.updateNews.message);
  }

  cancel() {
    this.isEdit = false;
    this.formGroup.disable();
    this.getDetailNews();
  }

  preview() {
    let formData = this.formGroup.getRawValue();

    this.previewForm = {
      News_Image: this.newLogoUrl,
      News_Title: formData.News_Title?.trim(),
      News_Url: formData.News_Url?.trim(),
      News_Content: formData.News_Content?.trim(),
      Moves_Company_ID: formData.Moves_Company_ID?.Moves_Company_ID,
      Charity_icon: this.news.Charity_icon,
      Charity_URL: this.news.Charity_URL,
      Company_Icon: (formData.Moves_Company_ID && formData.Moves_Company_ID.Company_Icon ) ? formData.Moves_Company_ID.Company_Icon : null,
      Company_URL: formData.Moves_Company_ID?.Company_URL,
      Appeal_ID: formData.Appeal_ID?.Appeal_ID,
      Appeal_Icon: (formData.Appeal_ID && formData.Appeal_ID.Appeal_Icon) ? formData.Appeal_ID.Appeal_Icon : null,
      Appeal_URL: formData.Appeal_ID?.Appeal_URL,
      Campaign_ID: formData.Campaign_ID?.Campaign_ID,
      Campaign_Icon: (formData.Campaign_ID && formData.Campaign_ID.Campaign_Icon)? formData.Campaign_ID.Campaign_Icon : null,
      Campaign_URL: formData.Campaign_ID?.Campaign_URL,
      News_Publish_Date: this.news?.News_Publish_Date,
      CreateBy: this.news?.CreateBy
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
