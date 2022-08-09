import { ValidaytorsService } from './../../../shared/services/validaytors.service';
import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { HandleFileService } from '../../../shared/services/handleFile.service';

import { UserService } from '../../services/user.service';
import { DataService } from '../../services/data.service';

import { UserInforModel } from '../../models/user.model';
import { UserPermissionModel } from '../../models/user.model';

import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.css']
})
export class DetailUserComponent implements OnInit {
  loading: boolean = false;
  formGroup: FormGroup;
  submitted: boolean = false;

  currentUserId: number;
  userId: number;

  userProfile: any;
  List_Permission_Type = [];
  List_User_Permission = [];

  checked = true;
  isAdd = false;
  isEdit = false;
  disablePermission = true;

  defaultLimitedFileSize = 2000000; //2MB
  strAcceptFile: string = 'image';
  uploadedFiles = [];
  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('currentLogo') currentLogo: ElementRef;
  @ViewChild('coverFilesInput') coverFilesInput: ElementRef;
  currentLogoUrl: any;
  newLogoUrl: any = null;

  width: number;
  height: number;
  selectedFile: any;

  error: any = {
    Surname: '',
    Forename: '',
    User_Job_Roll: '',
    User_Email: '',
    User_Phone_Number: ''
  }

  @Input() public permissionActive: boolean;

  @Input() public resultGridList: Array<any> = [];
  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private handleFileService: HandleFileService,
    private ref: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private userService: UserService,
    private dialogService: DialogService,
    private dataService: DataService,
    private validaytorsService: ValidaytorsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem('user'));
    this.currentUserId = parseInt(user.User_ID);
    this.userId = parseInt(user.User_ID);

    this.initForm();
    this.getUserInfor();
  }

  ngOnChanges(changes: SimpleChanges) {
    let data = changes?.resultGridList;
    this.resetErrorMess();

    if (data && data.currentValue?.action == 'add') {
      this.isAdd = true;
      this.isEdit = false;
      this.disablePermission = false;
      this.setFormCreate();
    }

    if (data && data.currentValue?.action == 'detail') {
      this.isAdd = false;
      this.isEdit = false;
      this.userId = parseInt(data.currentValue.user_ID);
      this.getUserInfor();
    }
  }

  initForm() {
    this.formGroup = this.formBuilder.group({
      Surname: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      Forename: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      User_Job_Roll: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      User_Email: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.email), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
      User_Phone_Number: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.phone_number), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]]
    });
  }

  setForm() {
    this.formGroup.setValue({
      Surname: this.userProfile ? this.userProfile.Surname : null,
      Forename: this.userProfile ? this.userProfile?.Forename : null,
      User_Job_Roll: this.userProfile ? this.userProfile?.User_Job_Roll : null,
      User_Email: this.userProfile ? this.userProfile?.User_Email : null,
      User_Phone_Number: this.userProfile ? this.userProfile?.User_Phone_Number : null
    });

    if (this.isEdit) {
      this.formGroup.get('User_Email').disable();
    } else {
      this.formGroup.get('User_Email').enable();
    }
  }

  async getUserInfor() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.userService.getUserInfor(this.userId);
      this.loading = loading;

      if (data.getUserInfor.messageCode == 200) {
        this.userProfile = data.getUserInfor.User;
        this.List_Permission_Type = data.getUserInfor.List_Permission_Type; //danh sách quyền trong hệ thống
        this.List_User_Permission = data.getUserInfor.List_User_Permission.map((item) =>
          Object.assign({
            Permission_Type_Name: this.List_Permission_Type.find(x => x.Permission_Type_ID == item.Permission_Type_ID)?.Permission_Type_Name
          }, item)
        ); //danh sách quyền của user đang selected

        this.List_Permission_Type.forEach(item => {
          let user_Permission = this.List_User_Permission.find(x => x.Permission_Type_ID == item.Permission_Type_ID);

          if (!user_Permission) {
            user_Permission = {
              User_Permission_ID: null,
              Permission_Type_ID: item.Permission_Type_ID,
              Permission_Type_Name: item.Permission_Type_Name,
              Is_Active: false,
            }
            this.List_User_Permission = [...this.List_User_Permission, user_Permission]
          }
        })

        this.currentLogoUrl = this.userProfile.User_Avatar ? this.userProfile.User_Avatar : '/assets/img/default_avatar.png';
      }
      else {
        this.showMessage('error', data.getUserInfor.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  setFormCreate() {
    this.userProfile = null;
    this.currentLogoUrl = '/assets/img/default_avatar.png';
    this.setUserPermission();

    this.setForm();
  }

  setUserPermission() {
    this.List_User_Permission = [];
    this.List_Permission_Type.forEach(item => {
      let user_Permission = {
        User_Permission_ID: null,
        Permission_Type_ID: item.Permission_Type_ID,
        Permission_Type_Name: item.Permission_Type_Name,
        Is_Active: false,
      }
      this.List_User_Permission = [...this.List_User_Permission, user_Permission]
    })
  }

  editDetail() {
    if (this.permissionActive) {
      this.isEdit = true;
      this.isAdd = false;
      this.disablePermission = false;
      this.setForm();
    } else if (this.currentUserId == this.userId) {
      this.isEdit = true;
      this.isAdd = false;
      this.disablePermission = true;
      this.setForm();
    }
    else {
      this.showMessage('error', 'You do not have maintain user permissions');
    }
  }

  cancel() {
    this.formGroup.reset();
    this.submitted = false;
    this.isAdd = false;
    this.isEdit = false;
    this.disablePermission = true;
    this.getUserInfor();
  }

  get f() { return this.formGroup.controls; }

  uploadImage() {
    document.getElementById('imageProfile').click()
  }

  changeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /*Event Thêm các file được chọn vào list file*/
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

        // if ((naturalWidth / naturalHeight) == 1) {
        //   this.currentLogoUrl = this.newLogoUrl;
        //   this.uploadedFiles = this.handleFileService.convertFileName(event.target);
        // }
        // else {
        //   this.uploadedFiles = [];
        //   this.showMessage('error', 'Image is incorrect ratio 1:1');
        // }
        this.currentLogoUrl = this.newLogoUrl;
        this.uploadedFiles = this.handleFileService.convertFileName(event.target);
      }, 500)
    } else {
      this.currentLogoUrl = (this.userProfile && this.userProfile.User_Avatar) ? this.userProfile.User_Avatar : '/assets/img/default_avatar.png'
    }
  }

  resetErrorMess() {
    this.error.Surname = '';
    this.error.Forename = '';
    this.error.User_Job_Roll = '';
    this.error.User_Email = '';
    this.error.User_Phone_Number = '';
  }

  showMessError() {
    if (this.formGroup.get('Surname').errors?.required || this.formGroup.get('Surname').errors?.forbiddenSpaceText) {
      this.error['Surname'] = 'This is mandatory field';
    } else if (this.formGroup.get('Surname').errors?.maxlength) {
      this.error['Surname'] = 'Maximum 255 characters exceeded';
    }

    if (this.formGroup.get('Forename').errors?.required || this.formGroup.get('Forename').errors?.forbiddenSpaceText) {
      this.error['Forename'] = 'This is mandatory field';
    } else if (this.formGroup.get('Forename').errors?.maxlength) {
      this.error['Forename'] = 'Maximum 255 characters exceeded';
    }

    if (this.formGroup.get('User_Job_Roll').errors?.required || this.formGroup.get('User_Job_Roll').errors?.forbiddenSpaceText) {
      this.error['User_Job_Roll'] = 'This is mandatory field';
    } else if (this.formGroup.get('User_Job_Roll').errors?.maxlength) {
      this.error['User_Job_Roll'] = 'Maximum 255 characters exceeded';
    }

    if (this.formGroup.get('User_Phone_Number').errors?.required || this.formGroup.get('User_Phone_Number').errors?.forbiddenSpaceText) {
      this.error['User_Phone_Number'] = 'This is mandatory field';
    } else if (this.formGroup.get('User_Phone_Number').errors?.pattern) {
      this.error['User_Phone_Number'] = 'Incorrect phone format';
    } else if (this.formGroup.get('User_Phone_Number').errors?.maxlength) {
      this.error['User_Phone_Number'] = 'Maximum 255 characters exceeded';
    }

    if (this.formGroup.get('User_Email').errors?.required || this.formGroup.get('User_Email').errors?.forbiddenSpaceText) {
      this.error['User_Email'] = 'This is mandatory field';
    } else if (this.formGroup.get('User_Email').errors?.pattern) {
      this.error['User_Email'] = 'Incorrect email format';
    } else if (this.formGroup.get('User_Email').errors?.maxlength) {
      this.error['User_Email'] = 'Maximum 255 characters exceeded';
    }
  }

  async createUser() {
    this.submitted = true;
    if (this.formGroup.invalid) {
      this.showMessError();

      return;
    }

    let formData = this.formGroup.value;
    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let user_Permission: any = [];
    this.List_User_Permission.forEach(item => {
      let list_User_Permission: UserPermissionModel =
      {
        Permission_Type_ID: item.Permission_Type_ID,
        Is_Active: item.Is_Active,
      };
      user_Permission = [...user_Permission, list_User_Permission]
    });

    let dataSave: UserInforModel = {
      Surname: formData.Surname.trim(),
      Forename: formData.Forename.trim(),
      User_Job_Roll: formData.User_Job_Roll.trim(),
      User_Phone_Number: formData.User_Phone_Number.trim(),
      User_Email: formData.User_Email.trim(),
      User_Avatar_File: file,
      List_User_Permission: user_Permission
    };

    try {
      this.loading = true;

      let { data, loading }: any = await this.userService.createUser(dataSave);
      this.loading = loading;
      if (data.createUser.messageCode != 200) {
        this.showMessage('error', data.createUser.message);
        return;
      }
      this.resetErrorMess();
      this.formGroup.reset();
      this.submitted = false;
      this.isAdd = false;
      this.isEdit = false;
      this.disablePermission = true;
      this.userId = data.createUser.User_ID;
      this.getUserInfor();
      this.showMessage('success', data.createUser.message);
      this.dataService.changeMessage("Update success"); //thay đổi message để call lại api list user trong component ListUser

    } catch (error) {
      this.showMessage('error', error);
    }
  }

  async save() {
    this.submitted = true;
    if (this.formGroup.invalid) {
      this.showMessError();

      return;
    }

    let formData = this.formGroup.value;
    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let user_Permission: any = [];
    this.List_User_Permission.forEach(item => {
      let list_User_Permission: UserPermissionModel =
      {
        User_Permission_ID: item.User_Permission_ID,
        Permission_Type_ID: item.Permission_Type_ID,
        User_ID: this.userId,
        Is_Active: item.Is_Active,
      };
      user_Permission = [...user_Permission, list_User_Permission]
    });

    let dataSave: UserInforModel = {
      User_ID: this.userId,
      Surname: formData.Surname.trim(),
      Forename: formData.Forename.trim(),
      User_Job_Roll: formData.User_Job_Roll.trim(),
      User_Phone_Number: formData.User_Phone_Number.trim(),
      User_Avatar_File: file,
      List_User_Permission: user_Permission
    };

    try {
      this.loading = true;

      let { data, loading }: any = await this.userService.updateUserInfor(dataSave);
      this.loading = loading;
      if (data.updateUserInfor.messageCode != 200) {
        this.showMessage('error', data.updateUserInfor.message);
        return;
      }
      this.resetErrorMess();
      this.formGroup.reset();
      this.submitted = false;
      this.isAdd = false;
      this.isEdit = false;
      this.disablePermission = true;
      this.getUserInfor();
      this.showMessage('success', data.updateUserInfor.message);
      this.dataService.changeMessage("Update success"); //thay đổi message để call lại api list user trong component ListUser

    } catch (error) {
      this.showMessage('error', error);
    }
  }

  changePass() {
    let ref = this.dialogService.open(ChangePasswordComponent, {
      data: {
        User_ID: this.userId
      },
      header: '',
      width: '400px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {

    });
  }

  permission() {
    this.router.navigate(['/permission']);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky: false };
    if (severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
