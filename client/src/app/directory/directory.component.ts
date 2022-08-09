import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

import { DashboardService } from '../dashboard/services/dashboard.service';
import { EncrDecrService } from '../shared/services/encrDecr.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  loading: boolean = false;

  colHeaderCharity: any = [];
  listCharity: any;

  colHeaderCompany: any = [];
  listCompany: any;

  activeIndex: number = 0;

  listIncomeBand: any = [];
  listGeographicalScope: any = [];
  listCharitySector: any = [];

  globalFilterCharity: string = null;
  globalFilterCompany: string = null;
  selectedIncomeBand: any = null;
  selectedGeographicScope: any = null;
  selectedCharitySector: any = null;

  @ViewChild('myTable') myTable: Table;
  @ViewChild('myTable2') myTable2: Table;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService
  ) { 
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(params['mode']) {
        this.activeIndex = params['mode'];
      }
    });

    this.colHeaderCharity = [
      { field: 'Charity_Name', header: '', textAlign: 'left', display: 'table-cell', colWith: '' },
      { field: 'Charity_URL', header: '', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Email', header: '', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Phone_Number', header: '', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Action', header: '', textAlign: 'center', display: 'table-cell', colWith: '15%' }
    ]

    this.colHeaderCompany = [
      { field: 'Company_Name', header: 'Appeal', textAlign: 'left', display: 'table-cell', colWith: '' },
      { field: 'Company_URL', header: 'Status', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Email', header: 'Launch date', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Phone_Number', header: 'End date', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Action', header: '', textAlign: 'center', display: 'table-cell', colWith: '15%' }
    ]

    this.getDirectory();
  }

  async getDirectory() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.dashboardService.getDirectory();
      this.loading = loading;

      if (data.getDirectory.messageCode == 200) {
        this.listIncomeBand = data.getDirectory.ListIncomeBand;
        this.listGeographicalScope = data.getDirectory.ListGeographicScope;
        this.listCharitySector = data.getDirectory.ListCharitySector;

        this.listCharity = data.getDirectory.ListCharity.map((item) =>
          Object.assign({
            ListCharitySectorID: null
          }, item)
        );

        //chuyển đổi mảng List_Charity_Sector_ID sang chuỗi để tìm kiếm
        this.listCharity.forEach(item => {
          let listId = '';
          item.List_Charity_Sector_ID.forEach(item2 => {
            listId += ',' + item2 + ','
          });
          item.ListCharitySectorID = listId;
        })

        this.listCompany = data.getDirectory.ListCompany.map((item) =>
          Object.assign({

          }, item)
        );
      }
      else {
        this.showMessage('error', data.getDirectory.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  applyFilterGlobal() {
    if (this.activeIndex == 0) {
      this.myTable.globalFilterFields = ['Charity_Name', 'Charity_Commission_No', 'Contact_Email', 'Contact_Phone_Number', 'Charity_URL'];
      this.myTable.filterGlobal(this.globalFilterCharity?.trim(), 'contains');
    } else {
      this.myTable2.globalFilterFields = ['Company_Name', 'Company_Number', 'Contact_Email', 'Contact_Phone_Number', 'Company_URL'];
      this.myTable2.filterGlobal(this.globalFilterCompany?.trim(), 'contains');
    }
  }

  search() {
    this.applyFilterGlobal();

    if (this.activeIndex == 0) {
      this.myTable.filter(this.selectedIncomeBand, 'Charity_Income_Band_ID', 'in');

      this.myTable.filter(this.selectedGeographicScope, 'Charity_Geographical_Scope', 'in');

      //mảng điều kiện cho chuỗi ListCharitySectorID
      let selectedCharitySectorId = [];
      this.selectedCharitySector?.forEach(item => {
        let sector = {
          value: ',' + item + ',', 
          matchMode: "contains", 
          operator: "or"
        }
        selectedCharitySectorId = [...selectedCharitySectorId, sector]
      })

      this.myTable.filters['ListCharitySectorID'] = selectedCharitySectorId;
    }
  }

  refresh() {
    if (this.activeIndex == 0) {
      this.globalFilterCharity = null;
      this.selectedIncomeBand = null;
      this.selectedGeographicScope = null;
      this.selectedCharitySector = null;

      this.search();
      this.myTable?.reset();
    } else {
      this.globalFilterCompany = null;

      this.search();
      this.myTable2?.reset();
    }
    this.getDirectory();
  }

  goToDetailCharity(Id) {
    this.router.navigate(['/dashboard', {type: this.encrDecrService.set(4), objectId: this.encrDecrService.set(Id)}])
  }

  goToDetailCompany(Id) {
    this.router.navigate(['/dashboard', {type: this.encrDecrService.set(5), objectId: this.encrDecrService.set(Id)}])
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
