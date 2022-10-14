import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './resetPassword.component.html',
  styleUrls: ['./resetPassword.component.css']
})
export class ResetPasswordComponent implements OnInit {
  loading: boolean = false;
  formGroup: FormGroup;
  submitted: boolean;
  message = '';
  error: any = {
    email: '',
    newPass: '',
    reNewPass: ''
  }
  type: number = 0; // 0 - Đăng ký tài khoản thành công và set password; 1 - forgot password
  hashCode: string = '';
  Charity_Name: string = '';
  Company_Name: string = '';
  is_Reset_Pass_From_Mobile: boolean = null;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private validaytorsService: ValidaytorsService
  ) {
    this.route.params.subscribe(params => {
      this.hashCode = params['id'];
      if(params['type']) {
        this.type = Number(params['type']);
      }
      if(params['Charity_Name']) {
        this.Charity_Name = params['Charity_Name'];
      }
      if(params['Company_Name']) {
        this.Company_Name = params['Company_Name'];
      }
    });
    if (this.hashCode) {
      this.authService.checkCodeResetPassword(this.hashCode).then(res => {
        if (res.messageCode != 200) {
          sessionStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          this.router.navigate(['/login'])
        }
      })
    }
  }
  ngOnInit(): void {
    this.initForm();
    this.message = this.hashCode ? 'Please enter your new password' : 'Enter your email and we will send you a link to reset your password';
  }

  initForm() {
    if (this.hashCode) {
      this.formGroup = this.formBuilder.group({
        newPass: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(24), this.validaytorsService.isValidPassword]],
        reNewPass: [null, [Validators.required]],
      });
    } else {
      this.formGroup = this.formBuilder.group({
        email: [null, [Validators.required, Validators.email]]
      });
    }
  }

  cancel() {
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  signPass() {
    this.submitted = true
    if (this.formGroup.invalid) {
      if (this.formGroup.get('email').errors?.required) {
        this.error['email'] = 'This field is mandatory';
      } else if (this.formGroup.get('email').errors?.email) {
        this.error['email'] = 'Incorrect email format';
      }
      return;
    }

    this.loading = true;
    this.authService.signResetPassWord(this.formGroup.get('email').value.trim(), window.location.href).then(res => {
      this.message = res.message;
      this.loading = false;
    })
  }

  updatePassword() {
    this.submitted = true

    if (this.formGroup.invalid) {
      if (this.formGroup.get('newPass').errors?.required) {
        this.error['newPass'] = 'This field is mandatory';
      }
      else if (this.formGroup.get('newPass').errors?.minlength || this.formGroup.get('newPass').errors?.maxlength) {
        this.error['newPass'] = 'Password must be greater than or equal to 6 and less than or equal to 24 characters';
      }
      else if (this.formGroup.get('newPass').errors?.invalidPassword) {
        this.error['newPass'] = 'Password must have at least 6 characters, at least one uppercase, at least one lowercase character and at least one number';
      }
      if (this.formGroup.get('reNewPass').errors?.required) {
        this.error['reNewPass'] = 'This field is mandatory';
      }
      return;
    }

    if (this.formGroup.get('newPass').value !== this.formGroup.get('reNewPass').value) {
      this.messageService.add({
        severity: 'error',
        summary: 'Notification',
        detail: 'Passwords do not match',
        sticky: true 
      })
      return;
    }

    this.loading = true;
    this.authService.changeResetPassword(this.hashCode, this.formGroup.get('newPass').value).then(res => {
      this.loading = false;
      
      this.messageService.add({
        severity: res.messageCode === 200 ? 'success' : 'error',
        summary: 'Notification',
        detail: res.message,
        sticky: res.messageCode === 200 ? false : true
      });

      this.is_Reset_Pass_From_Mobile = res.Is_Reset_Pass_From_Mobile;

      //Nếu không phải là reset pass từ mobile
      if (!this.is_Reset_Pass_From_Mobile) {
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
      //Nếu là reset pass từ mobile
      else {
        this.message = 'Password has been changed. Please go back to the Moves Matter app to log in.';
      }
    })
  }
}
