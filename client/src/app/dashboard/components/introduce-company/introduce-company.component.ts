import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';

import { DashboardService } from '../../services/dashboard.service';
import { Company } from '../../models/charity.model';

@Component({
  selector: 'app-introduce-company',
  templateUrl: './introduce-company.component.html',
  styleUrls: ['./introduce-company.component.css']
})
export class IntroduceCompanyComponent implements OnInit {
  loading: boolean = false;
  formGroup: FormGroup;
  submitted: boolean = false;

  message = null;
  error: any = {
    Company_Name: '',
    Company_Number: '',
    Contact_Name: '',
    Contact_Email: '',
    Contact_Phone_Number: ''
  }

  constructor(
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private data: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private validaytorsService: ValidaytorsService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      Company_Name: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Company_Number: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      Contact_Name: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Contact_Email: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.email), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Contact_Phone_Number: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.phone_number), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]]
    });
  }

  async save() {
    this.submitted = true;
    if (this.formGroup.invalid) {
      if (this.formGroup.get('Company_Name').errors?.required || this.formGroup.get('Company_Name').errors?.forbiddenSpaceText) {
        this.error['Company_Name'] = 'This is mandatory field';
      } else if (this.formGroup.get('Company_Name').errors?.maxlength) {
        this.error['Company_Name'] = 'Maximum 255 characters exceeded';
      }

      if (this.formGroup.get('Company_Number').errors?.required) {
        this.error['Company_Number'] = 'This is mandatory field';
      } else if (this.formGroup.get('Company_Number').errors?.pattern) {
        this.error['Company_Number'] = 'Only allow input number';
      }

      if (this.formGroup.get('Contact_Name').errors?.required || this.formGroup.get('Contact_Name').errors?.forbiddenSpaceText) {
        this.error['Contact_Name'] = 'This is mandatory field';
      } else if (this.formGroup.get('Contact_Name').errors?.maxlength) {
        this.error['Contact_Name'] = 'Maximum 255 characters exceeded';
      }

      if (this.formGroup.get('Contact_Email').errors?.required || this.formGroup.get('Contact_Email').errors?.forbiddenSpaceText) {
        this.error['Contact_Email'] = 'This is mandatory field';
      } else if (this.formGroup.get('email').errors?.pattern) {
        this.error['Contact_Email'] = 'Incorrect email format';
      } else if (this.formGroup.get('Contact_Email').errors?.maxlength) {
        this.error['Contact_Email'] = 'Maximum 255 characters exceeded';
      }

      if (this.formGroup.get('Contact_Phone_Number').errors?.required || this.formGroup.get('Contact_Phone_Number').errors?.forbiddenSpaceText) {
        this.error['Contact_Phone_Number'] = 'This is mandatory field';
      } else if (this.formGroup.get('Contact_Phone_Number').errors?.pattern) {
        this.error['Contact_Phone_Number'] = 'Incorrect phone format';
      } else if (this.formGroup.get('Contact_Phone_Number').errors?.maxlength) {
        this.error['Contact_Phone_Number'] = 'Maximum 255 characters exceeded';
      }

      return;
    }

    let formData = this.formGroup.value;
    let dataSave: Company = {
      Company_Name: formData.Company_Name.trim(),
      Company_Number: formData.Company_Number.trim(),
      Contact_Name: formData.Contact_Name.trim(),
      Contact_Email: formData.Contact_Email.trim(),
      Contact_Phone_Number: formData.Contact_Phone_Number.trim()
    }


    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.createCompany(dataSave);
      this.loading = loading;
      if (data.createCompany.messageCode != 200) {
        this.showMessage('error', data.createCompany.message);
        return;
      }
      this.message = data.createCompany.message;

    } catch (error) {
      this.showMessage('error', error);
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
