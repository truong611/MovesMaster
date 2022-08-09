import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { PopupListcompanyComponent } from '../popup-listcompany/popup-listcompany.component';

import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-list-company',
  templateUrl: './list-company.component.html',
  styleUrls: ['./list-company.component.css']
})
export class ListCompanyComponent implements OnInit {
  loading: boolean = false;
  colHeader: any = []
  listCompany = [];
  listAllCompany = [];

  globalFilter: string = null;

  @ViewChild('myTable') myTable: Table;

  constructor(
    private messageService: MessageService,
    private dialogService: DialogService,
    private companyService: CompanyService
  ) { }

  ngOnInit(): void {
    this.colHeader = [
      { field: 'Company_Name', header: 'Company Name', textAlign: 'left', display: 'table-cell', colWith: '' },
      { field: 'Company_Number', header: 'Company Number', textAlign: 'right', display: 'table-cell', colWith: '10%' },
      { field: 'Contact_Name', header: 'Contact Name', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Phone_Number', header: 'Contact Number', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Email', header: 'Contact Email', textAlign: 'left', display: 'table-cell', colWith: '20%' },
      { field: 'Created_Date', header: 'Date applied', textAlign: 'center', display: 'table-cell', colWith: '15%' },
      { field: 'Action', header: '', textAlign: 'center', display: 'table-cell', colWith: '100px' }
    ]

    this.getListCompanyNotActive();
  }

  async getListCompanyNotActive() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.companyService.getListCompanyNotActive();
      this.loading = loading;

      if (data.getListCompanyNotActive.messageCode == 200) {
        this.listAllCompany = data.getListCompanyNotActive.ListCompany.map((item) =>
          Object.assign({

          }, item)
        );

        this.listCompany = this.listAllCompany;
      }
      else {
        this.showMessage('error', data.getListCompanyNotActive.message);
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
      this.listCompany = this.listAllCompany.filter(x => keySearch != null
        && (x.Company_Name && x.Company_Name.toUpperCase().includes(keySearch) ||
          (x.Company_Number && x.Company_Number.toString().includes(keySearch)) ||
          (x.Contact_Name && x.Contact_Name.toUpperCase().includes(keySearch))));
    } else {
      this.listCompany = this.listAllCompany
    }
  }

  view(data) {
    let ref = this.dialogService.open(PopupListcompanyComponent, {
      data: {
        company: data
      },
      header: '',
      width: '1000px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {
      this.getListCompanyNotActive();
    })
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }

}
