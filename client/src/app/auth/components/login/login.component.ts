import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from "../../services/authentication.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { MessageService } from "primeng/api";

import { ValidaytorsService } from './../../../shared/services/validaytors.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private query: Subscription;
  formGroup: FormGroup;
  submitted: boolean = false;
  errors: string[] = [];
  @ViewChild('keywordsInput') keywordsInput;
  checked: boolean = true;
  error: any = {
    email: '',
    password: ''
  }

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    protected router: Router,
    private messageService: MessageService,
    private validaytorsService: ValidaytorsService
  ) {
    // redirect to home if already logged in
    if (this.authService.getUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    let refreshToken = JSON.parse(sessionStorage.getItem('refreshToken'));
    if (refreshToken) {
      this.refreshToken(refreshToken)
    }
  }

  async refreshToken(refreshToken) {
    let result: any = await this.authService.refreshToken(refreshToken);
    if (result.data.refreshToken?.messageCode == 200) {
      localStorage.setItem('user', JSON.stringify(result.data.refreshToken.user));
      sessionStorage.setItem("refreshToken", JSON.stringify(result.data.refreshToken.user.refreshToken));

      this.authService.setUser(result.data.refreshToken.user);

      let user = result.data.refreshToken.user;
      if (user.Is_Web_App_User) {
        sessionStorage.setItem('dashboard', 'true');
        this.router.navigateByUrl('/dashboard').then(() => {
          window.location.reload();
        });
      } else if (user.Is_Mobile_App_User) {
        this.router.navigate(['/home']);
      }
    }
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      email: [null, [Validators.required, , Validators.pattern(this.validaytorsService.regex.email), Validators.maxLength(255)]],
      password: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(24)]],
      checked: [true],
    });
  }

  login() {
    this.errors = [];
    this.submitted = true;
    if (this.formGroup.invalid) {
      if (this.formGroup.get('email').errors?.required) {
        this.error['email'] = 'This field is mandatory';
      } else if (this.formGroup.get('email').errors?.pattern) {
        this.error['email'] = 'Incorrect email format';
      }
      if (this.formGroup.get('password').errors?.required) {
        this.error['password'] = 'This field is mandatory';
      } else if (this.formGroup.get('password').errors['minlength'] || this.formGroup.get('password').errors['maxlength']) {
        this.error['password'] = 'Password must be greater than or equal to 6 and less than or equal to 24 characters';
      }
      return;
    }

    this.query = this.authService.login(this.formGroup.value.email.trim(), this.formGroup.value.password.trim()).valueChanges.subscribe((result: any) => {
      if (result.data.login?.messageCode == 200) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(result.data.login.user));

        if (this.formGroup.controls.checked.value) {
          sessionStorage.setItem("refreshToken", JSON.stringify(result.data.login.user.refreshToken));
        } else {
          sessionStorage.removeItem('refreshToken');
        }

        this.authService.setUser(result.data.login.user);

        let user = result.data.login.user;
        if (user.Is_Web_App_User) {
          sessionStorage.setItem('dashboard', 'true');
          this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
            window.location.reload();
          });
        } else if (user.Is_Mobile_App_User) {
          this.router.navigate(['/home']);
        }

      } else {
        this.showMessage('error', result.data.login.message);
      }
    });
  }

  ngOnDestroy() {
    this.query?.unsubscribe();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  goToPassword() {
    this.keywordsInput.nativeElement.focus();
  }

  signup() {
    this.router.navigate(['/sign-up']);
  }

}
