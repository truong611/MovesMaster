import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { PopupListcharityComponent } from '../popup-listcharity/popup-listcharity.component';

import { CharityService } from '../../services/charity.service';

@Component({
  selector: 'app-list-charity',
  templateUrl: './list-charity.component.html',
  styleUrls: ['./list-charity.component.css']
})
export class ListCharityComponent implements OnInit {
  loading: boolean = false;
  colHeader: any = [];

  listCharity = [];
  listAllCharity = [];

  globalFilter: string = null;

  @ViewChild('myTable') myTable: Table;

  constructor(
    private messageService: MessageService,
    private dialogService: DialogService,
    private charityService: CharityService
  ) { }

  ngOnInit(): void {

    this.colHeader = [
      { field: 'Charity_Name', header: 'Charity Name', textAlign: 'left', display: 'table-cell', colWith: '' },
      { field: 'Charity_Commission_No', header: 'Charity Number', textAlign: 'right', display: 'table-cell', colWith: '10%' },
      { field: 'Contact_Name', header: 'Contact Name', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Phone_Number', header: 'Contact Number', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'Contact_Email', header: 'Contact Email', textAlign: 'left', display: 'table-cell', colWith: '20%' },
      { field: 'Created_Date', header: 'Date Applied', textAlign: 'center', display: 'table-cell', colWith: '15%' },
      { field: 'Action', header: '', textAlign: 'center', display: 'table-cell', colWith: '100px' },
    ]

    this.getListCharityNotActive();
  }

  async getListCharityNotActive() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.charityService.getListCharityNotActive();
      this.loading = loading;

      if (data.getListCharityNotActive.messageCode == 200) {
        this.listAllCharity = data.getListCharityNotActive.ListCharity.map((item) =>
          Object.assign({

          }, item)
        );

        this.listCharity = this.listAllCharity;
      }
      else {
        this.showMessage('error', data.getListCharityNotActive.message);
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
      this.listCharity = this.listAllCharity.filter(x => keySearch != null
        && (x.Charity_Name && x.Charity_Name.toUpperCase().includes(keySearch) ||
          (x.Charity_Commission_No && x.Charity_Commission_No.toUpperCase().includes(keySearch)) ||
          (x.Contact_Name && x.Contact_Name.toUpperCase().includes(keySearch))));
    } else {
      this.listCharity = this.listAllCharity
    }
  }

  view(data) {
    let ref = this.dialogService.open(PopupListcharityComponent, {
      data: {
        charity: data
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
      this.getListCharityNotActive();
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
