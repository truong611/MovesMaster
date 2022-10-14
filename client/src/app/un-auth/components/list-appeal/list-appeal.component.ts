import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Router, ActivatedRoute } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AppealService } from '../../../appeal/services/appeal.service';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';
import { PermissionService } from './../../../shared/services/permission.service';

@Component({
  selector: 'app-list-appeal',
  templateUrl: './list-appeal.component.html',
  styleUrls: ['./list-appeal.component.css']
})
export class ListAppealComponent implements OnInit {
  loading: boolean = false;
  user = JSON.parse(localStorage.getItem('user'));
  objectId: number;
  isMyCharity: boolean = false;

  colHeader: any = [];
  totalAppeal: number = 0;
  listAllAppeal: any;
  listAppeal: any;
  activeIndex = 0;

  listStatus = []

  globalFilter: string = null;
  selectedStatus: any = null;
  @ViewChild('myTable') myTable: Table;

  permissionTypeCode = 'CCAA';
  permissionActive: boolean;

  constructor(
    private messageService: MessageService,
    private appealService: AppealService,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['objectId']) {
        this.objectId = Number(this.encrDecrService.get(params['objectId']));
        // if(this.user.Moves_Charity_ID == this.objectId) {
        //   this.isMyCharity = true;
        // }
      }
    });

    this.colHeader = [
      { field: 'Appeal_Icon_Image', header: '', textAlign: 'center', display: 'table-cell', colWith: '8vw' },
      { field: 'Appeal_Name', header: 'Appeal', textAlign: 'left', display: 'table-cell', colWith: '' },
      { field: 'Appeal_Status_Name', header: 'Status', textAlign: 'center', display: 'table-cell', colWith: '15vw' },
      { field: 'Appeal_Start_Date', header: 'Launch date', textAlign: 'center', display: 'table-cell', colWith: '15vw' },
      { field: 'Appeal_End_Date', header: 'End date', textAlign: 'center', display: 'table-cell', colWith: '15vw' },
      { field: 'Amount_Raised', header: 'Amount raised', textAlign: 'right', display: 'table-cell', colWith: '15vw' },
      { field: 'Live_Campaign', header: 'Live campaign(s)', textAlign: 'center', display: 'table-cell', colWith: '15vw' }
    ]

    this.getListAppeal();

  }

  async getListAppeal() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.appealService.getListAppeal(this.objectId);
      this.loading = loading;

      if (data.getListAppeal.messageCode == 200) {
        this.listStatus = data.getListAppeal.ListStatus;
        this.totalAppeal = data.getListAppeal.Total;
        this.listAllAppeal = data.getListAppeal.ListAppeal.map((item) =>
          Object.assign({
            Appeal_Icon_Image: item.Appeal_Icon ? item.Appeal_Icon : '/assets/img/Default Image.png'
          }, item)
        );

        this.listAppeal = this.listAllAppeal;
      }
      else {
        this.showMessage('error', data.getListAppeal.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }


  applyFilterGlobal() {
    let keySearch = this.globalFilter?.trim().toUpperCase();

    if (keySearch != null) {
      this.listAppeal = this.listAppeal.filter(x => keySearch != null && x.Appeal_Name.toUpperCase().includes(keySearch));
    } else {
      this.listAppeal = this.listAppeal
    }

  }

  search() {
    let listStatus = this.selectedStatus?.map(x => parseInt(x));
    let keySearch = this.globalFilter?.trim().toUpperCase();

    this.listAppeal = this.listAllAppeal;

    if (keySearch != null) {
      this.listAppeal = this.listAppeal.filter(x => keySearch != null && x.Appeal_Name.toUpperCase().includes(keySearch));
    }

    if(this.selectedStatus) {
      this.listAppeal = this.listAppeal.filter(x => listStatus.includes(x.Appeal_Status_ID));
    }
    
  }

  refresh() {
    this.globalFilter = null;
    this.selectedStatus = null;
    this.getListAppeal();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail };
    this.messageService.add(msg);
  }

}
