import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { PopupListcharityComponent } from '../popup-listcharity/popup-listcharity.component';

import { CharityService } from '../../services/charity.service';

@Component({
  selector: 'app-list-charity-recomment',
  templateUrl: './list-charity-recomment.component.html',
  styleUrls: ['./list-charity-recomment.component.css']
})
export class ListCharityRecommentComponent implements OnInit {
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
      { field: 'Contact_Email', header: 'Charity Email', textAlign: 'left', display: 'table-cell', colWith: '25%' },
      { field: 'Created_By', header: 'User id', textAlign: 'right', display: 'table-cell', colWith: '20%' },
      { field: 'Created_Date', header: 'Date applied', textAlign: 'center', display: 'table-cell', colWith: '15%' },
      { field: 'Action', header: '', textAlign: 'center', display: 'table-cell', colWith: '100px' },
    ]

    this.getListCharityInvitation();
  }

  async getListCharityInvitation() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.charityService.getListCharityInvitation();
      this.loading = loading;

      if (data.getListCharityInvitation.messageCode == 200) {
        this.listAllCharity = data.getListCharityInvitation.ListCharity.map((item) =>
          Object.assign({

          }, item)
        );

        this.listCharity = this.listAllCharity;
      }
      else {
        this.showMessage('error', data.getListCharityInvitation.message);
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
          (x.Contact_Email && x.Contact_Email.toUpperCase().includes(keySearch)) ||
          (x.Created_By && x.Created_By.includes(keySearch))));
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
      width: '800px',
      styleClass: 'custom-dialog',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "100%",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {
      this.getListCharityInvitation();
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
