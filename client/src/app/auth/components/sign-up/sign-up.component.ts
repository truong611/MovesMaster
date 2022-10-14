import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from "../../services/authentication.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { MessageService } from "primeng/api";
import { Location } from "@angular/common";
import { NgxCaptchaService, NgxCaptchaComponent } from '@binssoft/ngx-captcha';
import { ValidaytorsService } from 'src/app/shared/services/validaytors.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  loading: boolean = false;
  formGroup: FormGroup;
  submitted: boolean = false;
  listType = [
    { label: 'charity', value: '1' },
    { label: 'company', value: '2' }
  ];
  error: any = {
    Charity_Name: '',
    Charity_Commission_No: '',
    Contact_Name: '',
    Contact_Email: '',
    Contact_Phone_Number: '',
    Captcha: ''
  }

  captchaStatus: any = null;
  captchaConfig: any = {
    type: 1,
    length: 4,
    cssClass: 'custom',
    back: {
      stroke: "#2F9688",
      solid: "#f2efd2"
    },
    font: {
      color: "#000000",
      size: "35px"
    }
  };

  @ViewChild('captcha') captcha: NgxCaptchaComponent;
  @ViewChild('keywordsInput') keywordsInput;

  charityName: string = null;

  displaySuccess: boolean = false;
  message: string = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private charityUserService: AuthenticationService,
    private location: Location,
    private captchaService: NgxCaptchaService,
    private route: ActivatedRoute,
    private validaytorsService: ValidaytorsService
  ) {
    this.captchaService.captchStatus.subscribe((status) => {
      this.captchaStatus = status;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      this.charityName = params['name'];

      if (this.charityName) this.formGroup.get('Charity_Name').setValue(this.charityName);
    });
  }

  initForm() {
    let RegExps = new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$/);
    let emailPattern = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/);
    this.formGroup = this.formBuilder.group({
      Charity_Name: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Charity_Commission_No: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      Contact_Forename: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Contact_Surname: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Contact_Email: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.email), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Contact_Phone_Number: [null, [Validators.required, Validators.maxLength(255), Validators.pattern(this.validaytorsService.regex.phone_number), this.validaytorsService.forbiddenSpaceText]],
    });
  }

  async signup() {
    // debugger;
    this.submitted = true;
    
    this.captcha?.checkCaptcha();

    if (this.formGroup.invalid || !this.captchaStatus) {
      if (this.formGroup.get('Charity_Name').errors?.required || this.formGroup.get('Charity_Name').errors?.forbiddenSpaceText) {
        this.error['Charity_Name'] = 'This field is mandatory';
      } else if (this.formGroup.get('Charity_Name').errors?.maxLength) {
        this.error['Charity_Name'] = 'Please enter no more than 255 characters ';
      }

      if (this.formGroup.get('Charity_Commission_No').errors?.required) {
        this.error['Charity_Commission_No'] = 'This field is mandatory';
      } else if (this.formGroup.get('Charity_Commission_No').errors?.pattern) {
        this.error['Charity_Commission_No'] = 'Only allow input number';
      }

      if (this.formGroup.get('Contact_Forename').errors?.required || this.formGroup.get('Contact_Forename').errors?.forbiddenSpaceText) {
        this.error['Contact_Forename'] = 'This field is mandatory';
      } else if (this.formGroup.get('Contact_Forename').errors?.maxLength) {
        this.error['Contact_Forename'] = 'Please enter no more than 255 characters ';
      }

      if (this.formGroup.get('Contact_Surname').errors?.required || this.formGroup.get('Contact_Surname').errors?.forbiddenSpaceText) {
        this.error['Contact_Surname'] = 'This field is mandatory';
      } else if (this.formGroup.get('Contact_Surname').errors?.maxLength) {
        this.error['Contact_Surname'] = 'Please enter no more than 255 characters ';
      }

      if (this.formGroup.get('Contact_Email').errors?.required || this.formGroup.get('Contact_Email').errors?.forbiddenSpaceText) {
        this.error['Contact_Email'] = 'This field is mandatory';
      } else if (this.formGroup.get('Contact_Email').errors?.pattern) {
        this.error['Contact_Email'] = 'Invalid email address format';
      } else if (this.formGroup.get('Contact_Email').errors?.maxLength) {
        this.error['Contact_Email'] = 'Please enter no more than 255 characters ';
      }

      if (this.formGroup.get('Contact_Phone_Number').errors?.required) {
        this.error['Contact_Phone_Number'] = 'This field is mandatory';
      } else if (this.formGroup.get('Contact_Phone_Number').errors?.pattern) {
        this.error['Contact_Phone_Number'] = 'Invalid phone number format';
      } else if (this.formGroup.get('Contact_Phone_Number').errors?.maxLength) {
        this.error['Contact_Phone_Number'] = 'Please enter no more than 255 characters ';
      }

      if(!this.captchaStatus) {
        this.error['Captcha'] = 'Invalid Captcha';
      }
      
      return;
    }

    let rs = this.formGroup.value;
    let dataSaveCharity = {
      Charity_Name: rs.Charity_Name.trim(),
      Charity_Commission_No: rs.Charity_Commission_No.trim(),
      Contact_Forename: rs.Contact_Forename.trim(),
      Contact_Surname: rs.Contact_Surname.trim(),
      Contact_Email: rs.Contact_Email.trim().toLowerCase(),
      Contact_Phone_Number: rs.Contact_Phone_Number.trim(),
    }

    this.loading = true;
    let { data, loading }: any = await this.charityUserService.signup(dataSaveCharity)
    this.loading = loading;

    if (data.createCharity.messageCode != 200) {
      this.showMessage('error', data.createCharity.message);
      return;
    }
    
    this.displaySuccess = true;
    this.message = data?.createCharity?.message;
    // this.showMessage('success', data?.createCharity?.message);
    

    this.keywordsInput.nativeElement.focus()
    
    // .subscribe((data: any) => {
    //   if (data?.data?.createCharity?.messageCode != 200) {
    //     this.loading = false;
    //     this.showMessage('error', data?.data?.createCharity?.message);
    //     return;
    //   }
    //   this.loading = false;
    //   this.showMessage('success', data?.data?.createCharity?.message);
    //   setTimeout(() => {
    //     this.navigateToRegister();
    //   }, 2000);

    //   this.keywordsInput.nativeElement.focus()
    // });
  }

  navigateToHomePage() {
    this.router.navigate(['/home']);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  cancel() {
    this.location.back();
  }

  goToDirectory() {
    this.router.navigate(['/home-directory']);
  }

  close() {
    this.router.navigate(['/home']);
  }
}
