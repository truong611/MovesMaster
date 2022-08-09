import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, SortEvent } from 'primeng/api';
import { CampaignService } from '../../services/campaign.service';
import { EncrDecrService } from './../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css']
})
export class CampaignListComponent implements OnInit {
  loading: boolean = false;

  user: any = null;

  objectType: any = null;
  objectId: any = null;

  colHeader: any = [];
  totalCampaign: number = 0;
  listAllCampaign: any;
  listCampaign: any;
  activeIndex = 0;

  listStatus = []

  globalFilter: string = null;
  selectedStatus: any = null;
  @ViewChild('myTable') myTable: Table;

  permissionTypeCode = 'CIC';
  permissionActive: boolean;

  constructor(
    private messageService: MessageService,
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.route.params.subscribe(params => {
      if(params['objectType']) {
        this.objectType = this.encrDecrService.get(params['objectType']);
      }

      if(params['objectId']) {
        this.objectId = Number(this.encrDecrService.get(params['objectId']));
      }
    });

    this.colHeader = [
      { field: 'Campaign_Icon_Image', header: '', textAlign: 'center', display: 'table-cell', colWith: '8vw' },
      { field: 'Campaign_Name', header: 'Campaign', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Campaign_Status_Name', header: 'Status', textAlign: 'left', display: 'table-cell', colWith: '10vw' },
      { field: 'Charity_Name', header: 'Charity', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Appeal_Name', header: 'Appeal', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Company_Name', header: 'Company', textAlign: 'left', display: 'table-cell', colWith: '15vw' },
      { field: 'Campaign_Launch_Date', header: 'Launch', textAlign: 'center', display: 'table-cell', colWith: '10vw' },
      { field: 'AmountOrEndDate', header: 'Amount Or End Date', textAlign: 'right', display: 'table-cell', colWith: '10vw' },
      { field: 'Amount_Raised', header: 'Amount raised', textAlign: 'right', display: 'table-cell', colWith: '10vw' },
      { field: 'Progress', header: 'Progress', textAlign: 'right', display: 'table-cell', colWith: '10vw' },
      { field: 'Number_Matches', header: 'Matched (number matches)', textAlign: 'center', display: 'table-cell', colWith: '10vw' }
    ]

    this.getUserPermission();
    this.getListCampaign();

  }

  async getUserPermission() {
    let { data }: any = await this.permissionService.getUserPermission();

    if (data.getUserPermission.messageCode == 200) {
      let list_permission = data.getUserPermission.List_Permission;
      let user_permission = list_permission.find(x => x.Permission_Type_Code == this.permissionTypeCode);
      this.permissionActive = user_permission?.Is_Active ?? false;
    }
  }

  async getListCampaign() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.campaignService.getListCampaign(this.objectId, this.objectType);
      this.loading = loading;

      if (data.getListCampaign.messageCode == 200) {
        this.listStatus = data.getListCampaign.ListStatus;
        this.totalCampaign = data.getListCampaign.ListCampaign.length;
        this.listAllCampaign = data.getListCampaign.ListCampaign.map((item) =>
          Object.assign({
            Campaign_Icon_Image: item.Campaign_Icon ? item.Campaign_Icon : '/assets/img/Default Image.png',
            AmountOrEndDate: (item.End_Date_Target) ? item.Campaign_End_Date : item.Campaign_Target_Value,
            Progress: (item.End_Date_Target) ? this.getDiffDate(new Date(item.Campaign_Launch_Date), new Date()) : item.Progress_Number+'%'
          }, item)
        );

        this.listCampaign = this.listAllCampaign;
      }
      else {
        this.showMessage('error', data.getListCampaign.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }


  applyFilterGlobal() {
    

  }

  search() {
    let listStatus = this.selectedStatus?.map(x => parseInt(x));
    let keySearch = this.globalFilter?.trim().toUpperCase();

    this.listCampaign = this.listAllCampaign;

    if (keySearch != null) {
      this.listCampaign = this.listCampaign.filter(x => keySearch != null 
        && (x.Campaign_Name.toUpperCase().includes(keySearch) || 
        (x.Charity_Name && x.Charity_Name.toUpperCase().includes(keySearch)) || 
        (x.Company_Name && x.Company_Name.toUpperCase().includes(keySearch)) ||
        (x.Appeal_Name && x.Appeal_Name.toUpperCase().includes(keySearch))));
    }

    if(this.selectedStatus) {
      this.listCampaign = this.listCampaign.filter(x => listStatus.includes(x.Campaign_Status_ID));
    }
    
  }

  refresh() {
    this.globalFilter = null;
    this.selectedStatus = null;
    this.getListCampaign();
  }

  createCampaign() {
    if (this.user?.Is_Remove_Privileges) {
      this.showMessage('error', 'This action is not available while your privileges have been removed. Please contact Moves Matter Admin');
      return;
    }

    if (!this.permissionActive) {
      this.showMessage('error', 'You do not have permission to initiate Campaigns');
    }

    if(this.objectType == 'c') {
      this.router.navigate(['/campaign/campaign-create', { objectType: this.encrDecrService.set('appeal'), objectId: this.encrDecrService.set(this.objectId)}]);
    }

    if(this.objectType == 'a') {
      this.router.navigate(['/campaign/campaign-create', { objectType: this.encrDecrService.set('charity')}]);
    }
    
  }

  goToDetail(Id) {
    this.router.navigate(['/campaign/campaign-detail', { id: this.encrDecrService.set(Id) }])
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

  getDiffDate(date1: Date, date2: Date) {
    date1.setHours(0)
    date1.setMinutes(0)
    date1.setSeconds(0)

    date2.setHours(0)
    date2.setMinutes(0)
    date2.setSeconds(0)

    if (date1.getTime() >= date2.getTime()) {
      return '';
    }

    let diffTime = Math.abs(+date2 - +date1); //milliseconds

    let D = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (D > 0) {
      return D + ' days ago';
    }

    return '';
  }

  sortColumnInList(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      /* Customize */
      if (event.field == 'Progress') {
        if (data1.End_Date_Target) {
          value1 = data1.Progress_Date;
        }
        else {
          value1 = data1.Progress_Number;
        }

        if (data2.End_Date_Target) {
          value2 = data2.Progress_Date;
        }
        else {
          value2 = data2.Progress_Number;
        }
      }
      /* End */
      let result = null;
      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      return (event.order * result);
    });
  }

}
