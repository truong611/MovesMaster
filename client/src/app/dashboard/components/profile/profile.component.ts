import { ValidaytorsService } from '../../../shared/services/validaytors.service';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

import { MessageService } from 'primeng/api';
import { DashboardService } from '../../services/dashboard.service';
import { HandleFileService } from '../../../shared/services/handleFile.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

import { DashboardCharity } from '../../models/charity.model';
import { DashboardCompany } from '../../models/charity.model';

import { IntroduceCompanyComponent } from '../introduce-company/introduce-company.component';
import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));

  activeIndex = 0;

  isView: boolean = false;
  isEdit: boolean = false;
  disabled: boolean = true;
  formGroup: FormGroup;
  submitted: boolean = false;

  type: number;
  objectId: number;

  charity: any;
  company: any;
  totalCharityNotActive: number;
  totalCompanyNotActive: number;
  totalCharityInvitation: number;

  isMyCharity: boolean = false;
  isMyCompany: boolean = false;

  defaultLimitedFileSize = 10000000; //10MB
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

  listGeographicalScope = [];
  listIncomeBand = [];
  listCharitySector = [];

  error_charity: any = {
    Charity_Name: '',
    Charity_URL: '',
    Contact_Name: '',
    Contact_Email: '',
    Contact_Phone_Number: '',
    Charity_Date_Founded: '',
    Charity_Aims: '',
    Charity_Geographical_Scope: '',
    Charity_Income_Band_ID: '',
    Charity_Sector: '',
    Address_For_Invoice: '',
    Payment_Site_Url: '',
    Account_Name: '',
    Account_No: '',
    Sort_Code: '',
    Member_Payment_Site_Url: '',
    Member_Account_Name: '',
    Member_Account_No: '',
    Member_Sort_Code: '',
  }

  error_company: any = {
    Company_Name: '',
    Company_URL: '',
    Contact_Name: '',
    Contact_Email: '',
    Contact_Phone_Number: '',
    Company_CSR_Statement: ''
  }


  baseRoute = '/dashboard';
  nextRoute = '';

  permissionTypeCodeCharityPrivileges = 'CP';
  permissionCharityPrivilegesActive: boolean;

  permissionTypeCodeCharityAccess = 'CA';
  permissionCharityAccessActive: boolean;

  permissionTypeCodeCompanyPrivileges = 'CPR';
  permissionCompanyPrivilegesActive: boolean;

  permissionTypeCodeCompanyAccess = 'CAS';
  permissionCompanyAccessActive: boolean;

  permissionTypeCodeCanAdminister = 'CAR';
  permissionCanAdministerActive: boolean;

  permissionTypeCodeCanIntroduceCompany = 'CICY';
  permissionCanIntroduceCompanyActive: boolean;

  colHeader = [];
  List_Action_History = [];

  constructor(
    private formBuilder: FormBuilder,
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private handleFileService: HandleFileService,
    private ref: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private validaytorsService: ValidaytorsService,
    private encrDecrService: EncrDecrService,
    private router: Router,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['objectId']) {
        this.objectId = Number(this.encrDecrService.get(params['objectId']));
      }
      else {
        this.objectId = null;
        this.isMyCharity = false;
        this.isMyCompany = false;
      }

      if (params['type']) {
        this.type = Number(this.encrDecrService.get(params['type']));
      }
      else {
        this.type = this.user.Type; //type: 1 hoặc 4: charity, 2 hoặc 5: company
      }

      if (this.type == 1 || (this.type == 4 && this.user.Moves_Charity_ID == this.objectId)) this.isMyCharity = true;
      else this.isMyCharity = false;

      if (this.type == 2 || (this.type == 5 && this.user.Moves_Company_ID == this.objectId)) this.isMyCompany = true;
      else this.isMyCompany = false;

      this.getUserPermission();

      this.getDashboardProfile();
      this.initForm();

      this.colHeader = [
        { field: 'Action', header: '', textAlign: 'left', display: 'table-cell', colWith: '' },
        { field: 'Action_Date', header: 'Date', textAlign: 'center', display: 'table-cell', colWith: '10%' },
        { field: 'User_Name', header: 'By', textAlign: 'left', display: 'table-cell', colWith: '15%' }
      ]

      this.isView = false;
    });

  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;

      let user_permission_charity_privileges = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCharityPrivileges);
      this.permissionCharityPrivilegesActive = user_permission_charity_privileges?.Is_Active ?? false;

      let user_permission_charity_access = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCharityAccess);
      this.permissionCharityAccessActive = user_permission_charity_access?.Is_Active ?? false;

      let user_permission_company_privileges = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCompanyPrivileges);
      this.permissionCompanyPrivilegesActive = user_permission_company_privileges?.Is_Active ?? false;

      let user_permission_company_access = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCompanyAccess);
      this.permissionCompanyAccessActive = user_permission_company_access?.Is_Active ?? false;

      let user_permission_can_administer = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCanAdminister);
      this.permissionCanAdministerActive = user_permission_can_administer?.Is_Active ?? false;

      let user_permission_can_introduce = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCodeCanIntroduceCompany);
      this.permissionCanIntroduceCompanyActive = user_permission_can_introduce?.Is_Active ?? false;
    }
  }

  initForm() {
    if (this.type == 1 || this.type == 4) {
      this.formGroup = this.formBuilder.group({
        Charity_Name: [{ value: null, disabled: true }],
        Charity_Commission_No: [{ value: null, disabled: true }],
        Moves_Charity_ID: [{ value: null, disabled: true }],
        Charity_URL: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText, this.validaytorsService.isValidHttpUrl]],
        Contact_Name: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
        Contact_Email: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.email), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
        Contact_Phone_Number: [null, [Validators.required, Validators.pattern(this.validaytorsService.regex.phone_number), Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
        Charity_Date_Founded: [null, [Validators.required]],
        Charity_Aims: [null, [Validators.required, this.validaytorsService.forbiddenSpaceText]],
        Charity_Geographical_Scope: [null, [Validators.required]],
        Charity_Income_Band_ID: [null, [Validators.required]],
        Charity_Sector: [null, [Validators.required]],
        Date_Active: [null],
        Address_For_Invoice: [null],
        Payment_Site_Url: [null, [this.validaytorsService.isValidHttpUrl]],
        Account_Name: [null],
        Account_No: [null],
        Sort_Code: [null],
        Member_Payment_Site_Url: [null, [this.validaytorsService.isValidHttpUrl]],
        Member_Account_Name: [null],
        Member_Account_No: [null],
        Member_Sort_Code: [null]
      });
    }

    if (this.type == 2 || this.type == 5) {
      this.formGroup = this.formBuilder.group({
        Company_Name: [{ value: null, disabled: true }],
        Company_Number: [{ value: null, disabled: true }],
        Moves_Company_ID: [{ value: null, disabled: true }],
        Company_URL: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText, this.validaytorsService.isValidHttpUrl]],
        Contact_Name: [null, [Validators.required, Validators.maxLength(255), this.validaytorsService.forbiddenSpaceText]],
        Contact_Email: [null, [Validators.required, , Validators.maxLength(255), Validators.pattern(this.validaytorsService.regex.email), this.validaytorsService.forbiddenSpaceText]],
        Contact_Phone_Number: [null, [Validators.required, Validators.maxLength(255), Validators.pattern(this.validaytorsService.regex.phone_number), this.validaytorsService.forbiddenSpaceText]],
        Company_CSR_Statement: [null, [Validators.required, this.validaytorsService.forbiddenSpaceText]],
        Date_Active: [null],
      });
    }
  }

  setForm() {
    let Geographical_Scope = this.listGeographicalScope.find(x => x.Category_ID == this.charity?.Charity_Geographical_Scope) ?? null;
    let Income_Band = this.listIncomeBand.find(x => x.Category_ID == this.charity?.Charity_Income_Band_ID) ?? null;

    if (this.type == 1 || this.type == 4) {
      this.formGroup.setValue({
        Charity_Name: this.charity?.Charity_Name ?? null,
        Charity_Commission_No: this.charity?.Charity_Commission_No ?? null,
        Moves_Charity_ID: this.charity?.Moves_Charity_ID ?? null,
        Charity_URL: this.charity?.Charity_URL ?? null,
        Contact_Name: this.charity?.Contact_Name ?? null,
        Contact_Email: this.charity?.Contact_Email ?? null,
        Contact_Phone_Number: this.charity?.Contact_Phone_Number ?? null,
        Charity_Date_Founded: this.charity?.Charity_Date_Founded ? new Date(this.charity?.Charity_Date_Founded) : null,
        Charity_Aims: this.charity?.Charity_Aims ?? null,
        Charity_Geographical_Scope: Geographical_Scope,
        Charity_Income_Band_ID: Income_Band,
        Charity_Sector: this.listCharitySector.filter(x => this.charity?.List_Charity_Sector_ID.includes(x.Category_ID)),
        Date_Active: this.charity?.Date_Active ? new Date(this.charity?.Date_Active) : null,
        Address_For_Invoice: this.charity?.Address_For_Invoice ?? null,
        Payment_Site_Url: this.charity?.Payment_Site_Url ?? null,
        Account_Name: this.charity?.Account_Name ?? null,
        Account_No: this.charity?.Account_No ?? null,
        Sort_Code: this.charity?.Sort_Code ?? null,
        Member_Payment_Site_Url: this.charity?.Member_Payment_Site_Url ?? null,
        Member_Account_Name: this.charity?.Member_Account_Name ?? null,
        Member_Account_No: this.charity?.Member_Account_No ?? null,
        Member_Sort_Code: this.charity?.Member_Sort_Code ?? null
      });
    }

    if (this.type == 2 || this.type == 5) {
      this.formGroup.setValue({
        Company_Name: this.company?.Company_Name,
        Company_Number: this.company?.Company_Number,
        Moves_Company_ID: this.company?.Moves_Company_ID,
        Company_URL: this.company?.Company_URL,
        Contact_Name: this.company?.Contact_Name,
        Contact_Email: this.company?.Contact_Email,
        Contact_Phone_Number: this.company?.Contact_Phone_Number,
        Company_CSR_Statement: this.company?.Company_CSR_Statement,
        Date_Active: this.company?.Date_Active ? new Date(this.company?.Date_Active) : null,
      });
    }
  }

  async getDashboardProfile() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDashboardProfile(this.type, this.objectId);
      this.loading = loading;

      if (data.getDashboardProfile.messageCode == 200) {
        this.charity = data.getDashboardProfile.Charity;
        this.company = data.getDashboardProfile.Company;

        if (this.type == 1 || this.type == 4) {
          this.currentLogoUrl = this.charity.Charity_icon ? this.charity.Charity_icon : '/assets/img/Default Image.png'
        }

        if (this.type == 2 || this.type == 5) {
          this.currentLogoUrl = this.company.Company_Icon ? this.company.Company_Icon : '/assets/img/Default Image.png'
        }

        this.listGeographicalScope = data.getDashboardProfile.List_Geographical_Scope;
        this.listIncomeBand = data.getDashboardProfile.List_Income_Band;
        this.listCharitySector = data.getDashboardProfile.List_Sector;
        this.List_Action_History = data.getDashboardProfile.List_Action_History.map((item) =>
          Object.assign({
            User_Name: (item.Forename ? item.Forename : '') + ' ' + (item.Surname ? item.Surname : '')
          }, item)
        );

        this.totalCharityNotActive = data.getDashboardProfile.TotalCharityNotActive;
        this.totalCompanyNotActive = data.getDashboardProfile.TotalCompanyNotActive;
        this.totalCharityInvitation = data.getDashboardProfile.TotalCharityInvitation;

        if (!this.user.IsAdmin) {
          this.setForm();
        }

      }
      else {
        this.showMessage('error', data.getDashboardProfile.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  viewProfile() {
    this.isView = true;
    this.formGroup.disable();
  }

  editProfile() {
    if (!this.permissionCanAdministerActive) {
      this.showMessage('error', 'You need to be administrator to edit these details');
      return;
    }

    this.isEdit = true;
    this.formGroup.enable();

    if (this.isMyCharity) {
      this.formGroup.get('Charity_Name').disable();
      this.formGroup.get('Charity_Commission_No').disable();
      this.formGroup.get('Moves_Charity_ID').disable();
      this.formGroup.get('Date_Active').disable();
    }
    if (this.isMyCompany) {
      this.formGroup.get('Company_Name').disable();
      this.formGroup.get('Company_Number').disable();
      this.formGroup.get('Moves_Company_ID').disable();
      this.formGroup.get('Date_Active').disable();
    }
  }

  back() {
    this.isView = false;
    this.isEdit = false;
    this.activeIndex = 0;
  }

  introduce() {
    let ref = this.dialogService.open(IntroduceCompanyComponent, {
      data: {

      },
      header: '',
      width: '500px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {

    });
  }

  get f() { return this.formGroup.controls; }

  cancel() {
    this.isEdit = false;
    this.viewProfile();
    this.setError();
    if (this.isMyCharity) {
      this.currentLogoUrl = this.charity.Charity_icon ? this.charity.Charity_icon : '/assets/img/Default Image.png'
    }

    if (this.isMyCompany) {
      this.currentLogoUrl = this.company.Company_Icon ? this.company.Company_Icon : '/assets/img/Default Image.png'
    }
  }

  setError() {
    this.error_charity = {
      Charity_Name: '',
      Charity_URL: '',
      Contact_Name: '',
      Contact_Email: '',
      Contact_Phone_Number: '',
      Charity_Date_Founded: '',
      Charity_Aims: '',
      Charity_Geographical_Scope: '',
      Charity_Income_Band_ID: '',
      Charity_Sector: '',
      Address_For_Invoice: '',
      Payment_Site_Url: '',
      Account_Name: '',
      Account_No: '',
      Sort_Code: '',
      Member_Payment_Site_Url: '',
      Member_Account_Name: '',
      Member_Account_No: '',
      Member_Sort_Code: '',
    }

    this.error_company = {
      Company_Name: '',
      Company_URL: '',
      Contact_Name: '',
      Contact_Email: '',
      Contact_Phone_Number: '',
      Company_CSR_Statement: ''
    }
  }

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

        // if ((naturalWidth / naturalHeight) != 1.5) {
        //   this.uploadedFiles = [];
        //   this.showMessage('error', 'Image is incorrect ratio');
        // }

        this.currentLogoUrl = this.newLogoUrl;
        this.uploadedFiles = this.handleFileService.convertFileName(event.target);
      }, 500)
    } else {
      if (this.isMyCharity) {
        this.currentLogoUrl = this.charity.Charity_icon ? this.charity.Charity_icon : '/assets/img/Default Image.png'
      }

      if (this.isMyCompany) {
        this.currentLogoUrl = this.company.Company_Icon ? this.company.Company_Icon : '/assets/img/Default Image.png'
      }
    }

  }

  async onEditSave() {
    this.submitted = true;
    if (this.formGroup.invalid) {
      if (this.isMyCharity) {
        if (this.formGroup.get('Charity_URL').errors?.required || this.formGroup.get('Charity_URL').errors?.forbiddenSpaceText) {
          this.error_charity['Charity_URL'] = 'This is mandatory field';
        } else if (this.formGroup.get('Charity_URL').errors?.invalidUrl) {
          this.error_charity['Charity_URL'] = 'Incorrect url format';
        } else if (this.formGroup.get('Charity_URL').errors?.maxlength) {
          this.error_charity['Charity_URL'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Name').errors?.required || this.formGroup.get('Contact_Name').errors?.forbiddenSpaceText) {
          this.error_charity['Contact_Name'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Name').errors?.maxlength) {
          this.error_charity['Contact_Name'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Email').errors?.required || this.formGroup.get('Contact_Email').errors?.forbiddenSpaceText) {
          this.error_charity['Contact_Email'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Email').errors?.pattern) {
          this.error_charity['Contact_Email'] = 'Incorrect email format';
        } else if (this.formGroup.get('Contact_Email').errors?.maxlength) {
          this.error_charity['Contact_Email'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Phone_Number').errors?.required || this.formGroup.get('Contact_Phone_Number').errors?.forbiddenSpaceText) {
          this.error_charity['Contact_Phone_Number'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Phone_Number').errors?.pattern) {
          this.error_charity['Contact_Phone_Number'] = 'Incorrect phone format';
        } else if (this.formGroup.get('Contact_Phone_Number').errors?.maxlength) {
          this.error_charity['Contact_Phone_Number'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Charity_Date_Founded').errors?.required) {
          this.error_charity['Charity_Date_Founded'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Charity_Aims').errors?.required || this.formGroup.get('Charity_Aims').errors?.forbiddenSpaceText) {
          this.error_charity['Charity_Aims'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Charity_Geographical_Scope').errors?.required) {
          this.error_charity['Charity_Geographical_Scope'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Charity_Income_Band_ID').errors?.required) {
          this.error_charity['Charity_Income_Band_ID'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Charity_Sector').errors?.required) {
          this.error_charity['Charity_Sector'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Payment_Site_Url').errors?.required || this.formGroup.get('Payment_Site_Url').errors?.forbiddenSpaceText) {
          this.error_charity['Payment_Site_Url'] = 'This is mandatory field';
        } else if (this.formGroup.get('Payment_Site_Url').errors?.invalidUrl) {
          this.error_charity['Payment_Site_Url'] = 'Incorrect url format';
        }

        if (this.formGroup.get('Account_Name').errors?.required) {
          this.error_charity['Account_Name'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Account_No').errors?.required) {
          this.error_charity['Account_No'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Sort_Code').errors?.required) {
          this.error_charity['Sort_Code'] = 'This is mandatory field';
        }

        if (this.formGroup.get('Member_Payment_Site_Url').errors?.invalidUrl) {
          this.error_charity['Member_Payment_Site_Url'] = 'Incorrect url format';
        }

      }

      if (this.isMyCompany) {
        if (this.formGroup.get('Company_URL').errors?.required || this.formGroup.get('Company_URL').errors?.forbiddenSpaceText) {
          this.error_company['Company_URL'] = 'This is mandatory field';
        } else if (this.formGroup.get('Company_URL').errors?.invalidUrl) {
          this.error_company['Company_URL'] = 'Incorrect url format';
        } else if (this.formGroup.get('Company_URL').errors?.maxlength) {
          this.error_company['Company_URL'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Name').errors?.required || this.formGroup.get('Contact_Name').errors?.forbiddenSpaceText) {
          this.error_company['Contact_Name'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Name').errors?.maxlength) {
          this.error_company['Contact_Name'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Email').errors?.required || this.formGroup.get('Contact_Email').errors?.forbiddenSpaceText) {
          this.error_company['Contact_Email'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Email').errors?.pattern) {
          this.error_company['Contact_Email'] = 'Incorrect email format';
        } else if (this.formGroup.get('Contact_Email').errors?.maxlength) {
          this.error_company['Contact_Email'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Contact_Phone_Number').errors?.required || this.formGroup.get('Contact_Phone_Number').errors?.forbiddenSpaceText) {
          this.error_company['Contact_Phone_Number'] = 'This is mandatory field';
        } else if (this.formGroup.get('Contact_Phone_Number').errors?.pattern) {
          this.error_company['Contact_Phone_Number'] = 'Incorrect phone format';
        } else if (this.formGroup.get('Contact_Phone_Number').errors?.maxlength) {
          this.error_company['Contact_Phone_Number'] = 'Maximum 255 characters exceeded';
        }

        if (this.formGroup.get('Company_CSR_Statement').errors?.required || this.formGroup.get('Company_CSR_Statement').errors?.forbiddenSpaceText) {
          this.error_company['Company_CSR_Statement'] = 'This is mandatory field';
        }
      }

      return;
    }

    let formData = this.formGroup.value;
    let file = (this.uploadedFiles.length > 0) ? this.uploadedFiles[0] : null;

    let dataSaveCharity: DashboardCharity;
    let dataSaveCompany: DashboardCompany;

    if (this.isMyCharity) {
      dataSaveCharity = {
        Charity_URL: formData.Charity_URL.trim(),
        Contact_Name: formData.Contact_Name.trim(),
        Contact_Email: formData.Contact_Email.trim(),
        Contact_Phone_Number: formData.Contact_Phone_Number.trim(),
        Charity_Date_Founded: formData.Charity_Date_Founded,
        Charity_Aims: formData.Charity_Aims,
        Charity_icon_file: file,
        Charity_Geographical_Scope: formData.Charity_Geographical_Scope.Category_ID,
        Charity_Income_Band_ID: formData.Charity_Income_Band_ID.Category_ID,
        ListCategoryId: formData.Charity_Sector.map(x => x.Category_ID),
        Address_For_Invoice: formData.Address_For_Invoice ? formData.Address_For_Invoice.trim() : null,
        Payment_Site_Url: formData.Payment_Site_Url ? formData.Payment_Site_Url.trim() : null,
        Account_Name: formData.Account_Name ? formData.Account_Name.trim() : null,
        Account_No: formData.Account_No ? formData.Account_No.trim() : null,
        Sort_Code: formData.Sort_Code ? formData.Sort_Code.trim() : null,
        Member_Payment_Site_Url: formData.Member_Payment_Site_Url ? formData.Member_Payment_Site_Url.trim() : null,
        Member_Account_Name: formData.Member_Account_Name ? formData.Member_Account_Name.trim() : null,
        Member_Account_No: formData.Member_Account_No ? formData.Member_Account_No.trim() : null,
        Member_Sort_Code: formData.Member_Sort_Code ? formData.Member_Sort_Code.trim() : null,
      }
    }

    if (this.isMyCompany) {
      dataSaveCompany = {
        Company_URL: formData.Company_URL.trim(),
        Contact_Name: formData.Contact_Name.trim(),
        Contact_Email: formData.Contact_Email.trim(),
        Contact_Phone_Number: formData.Contact_Phone_Number.trim(),
        Company_CSR_Statement: formData.Company_CSR_Statement,
        Company_Icon_File: file
      }
    }


    try {
      this.loading = true;

      if (this.isMyCharity) {
        let { data, loading }: any = await this.dashboardService.updateDashboardCharity(dataSaveCharity);
        this.loading = loading;
        if (data.updateDashboardCharity.messageCode != 200) {
          this.showMessage('error', data.updateDashboardCharity.message);
          return;
        }
        this.isEdit = false;
        this.viewProfile();
        this.getDashboardProfile();
        this.showMessage('success', data.updateDashboardCharity.message);
      }

      if (this.isMyCompany) {
        let { data, loading }: any = await this.dashboardService.updateDashboardCompany(dataSaveCompany);
        this.loading = loading;
        if (data.updateDashboardCompany.messageCode != 200) {
          this.showMessage('error', data.updateDashboardCompany.message);
          return;
        }
        this.isEdit = false;
        this.viewProfile();
        this.getDashboardProfile();
        this.showMessage('success', data.updateDashboardCompany.message);
      }


    } catch (error) {
      this.showMessage('error', error);
    }
  }

  contact() {
    let ref = this.dialogService.open(PopupContactComponent, {
      data: {
        type: this.type,
        objectId: this.objectId,
        objectName: this.type == 4 ? this.charity.Charity_Name : this.company.Company_Name
      },
      header: '',
      width: '500px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {

    });
  }

  async updateRemovePrivileges(type) {
    //type: 1-dashboard charity, 2-dashboard company
    if (!this.permissionCharityPrivilegesActive && type == 1) {
      this.showMessage('error', 'You do not have permission to update Charity Privileges');
      return;
    }

    if (!this.permissionCompanyPrivilegesActive && type == 2) {
      this.showMessage('error', 'You do not have permission to update Company Privileges');
      return;
    }

    try {
      this.loading = true;

      let { data, loading }: any = await this.dashboardService.updateRemovePrivileges(this.type, this.objectId);
      this.loading = loading;
      if (data.updateRemovePrivileges.messageCode != 200) {
        this.showMessage('error', data.updateRemovePrivileges.message);
        return;
      }
      this.getDashboardProfile();
      this.showMessage('success', data.updateRemovePrivileges.message);

    } catch (error) {
      this.showMessage('error', error);
    }
  }

  async updateRemoveAccess(type) {
    //type: 1-dashboard charity, 2-dashboard company
    if (!this.permissionCharityAccessActive && type == 1) {
      this.showMessage('error', 'You do not have permission to update Charity Access');
      return;
    }

    if (!this.permissionCompanyAccessActive && type == 2) {
      this.showMessage('error', 'You do not have permission to update Company Access');
      return;
    }

    try {
      this.loading = true;

      let { data, loading }: any = await this.dashboardService.updateRemoveAccess(this.type, this.objectId);
      this.loading = loading;
      if (data.updateRemoveAccess.messageCode != 200) {
        this.showMessage('error', data.updateRemoveAccess.message);
        return;
      }
      this.getDashboardProfile();
      this.showMessage('success', data.updateRemoveAccess.message);

    } catch (error) {
      this.showMessage('error', error);
    }
  }

  goToListCharity() {
    this.router.navigate(['/charity/list-charity']);
  }

  goToListRecomment() {
    this.router.navigate(['/charity/list-charity-recomment']);
  }

  goToListCompany() {
    this.router.navigate(['/company/list-company']);
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
