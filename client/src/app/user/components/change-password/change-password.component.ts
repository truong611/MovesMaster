
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { UserService } from '../../services/user.service';
import { ValidaytorsService } from '../../../shared/services/validaytors.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  loading: boolean = false;
  userId: number;
  formGroup: FormGroup;
  submitted: boolean;
  error: any = {
    Current_Password: '',
    New_Password: '',
    Renew_Password: ''
  }
  constructor(
    private formBuilder: FormBuilder,
    private data: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private userService: UserService,
    private messageService: MessageService,
    private validaytorsService: ValidaytorsService,
  ) { }

  ngOnInit(): void {
    this.userId = this.data.data.User_ID;
    this.initForm();
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      Current_Password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]],
      New_Password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(24), Validators.pattern(this.validaytorsService.regex.password)]],
      Renew_Password: [null, [Validators.required]],
    });
  }

  async save() {
    this.submitted = true;
    if (this.formGroup.invalid) {
      if (this.formGroup.get('Current_Password').errors?.required) {
        this.error['Current_Password'] = 'This is mandatory field';
      } else if (this.formGroup.get('Current_Password').errors?.minLength|| this.formGroup.get('Current_Password').errors?.maxlength) {
        this.error['Current_Password'] = 'Password must be greater than or equal to 6 and less than or equal to 24 characters';
      }

      if (this.formGroup.get('New_Password').errors?.required) {
        this.error['New_Password'] = 'This is mandatory field';
      } else if (this.formGroup.get('New_Password').errors?.minlength || this.formGroup.get('New_Password').errors?.maxlength) {
        this.error['New_Password'] = 'Password must be greater than or equal to 6 and less than or equal to 24 characters';
      } else if (this.formGroup.get('New_Password').errors?.pattern) {
        this.error['New_Password'] = 'Password must have at least 6 characters, at least one uppercase, at least one lowercase character and at least one number';
      }

      if (this.formGroup.get('Renew_Password').errors?.required) {
        this.error['Renew_Password'] = 'This is mandatory field';
      }
      
      return;
    }

    if (this.formGroup.get('New_Password').value !== this.formGroup.get('Renew_Password').value) {
      this.showMessage('error', 'Confirm Password is incorrect');
      return;
    }

    let formData = this.formGroup.value;

    try {
      this.loading = true;

      let { data, loading }: any = await this.userService.changeUserPassword(this.userId, formData.Current_Password, formData.New_Password);
      this.loading = loading;
      if (data.changeUserPassword.messageCode != 200) {
        this.showMessage('error', data.changeUserPassword.message);
        return;
      }
      this.cancel();
      this.showMessage('success', data.changeUserPassword.message);

    } catch (error) {
      this.showMessage('error', error );
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
