import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Message } from '../../../models/tin-nhan/message.model';
import { DialogService } from 'primeng/dynamicdialog';
import { TinNhanDialogComponent } from '../tin-nhan-dialog/tin-nhan-dialog.component';
import { MessageAppService } from '../../../services/message-app.service';
import { FormatDateService } from '../../../../shared/services/formatDate.services';

@Component({
  selector: 'app-tin-nhan',
  templateUrl: './tin-nhan.component.html',
  styleUrls: ['./tin-nhan.component.css'],
  providers: [DialogService]
})
export class TinNhanComponent implements OnInit {
  loading: boolean = false;

  listMessage: Array<Message> = [];
  cols: any[];
  globalFilter: string = null;
  listStatus: Array<any> = [
    { name: 'Lưu nháp', value: 0 },
    { name: 'Đã gửi', value: 1 },
  ]
  selectedStatus: Array<any> = [];

  @ViewChild('myTable') myTable: Table;

  fromCreatedDate: Date = null;
  toCreatedDate: Date = null;
  fromSendDate: Date = null;
  toSendDate: Date = null;


  constructor(
    public router: Router,
    public messageService: MessageService,
    public confirmationService: ConfirmationService,
    public dialogService: DialogService,
    public messageAppService: MessageAppService,
    public formatDateService: FormatDateService,
  ) { }

  ngOnInit(): void {
    this.initTable();
    this.getMasterData();
  }

  initTable() {
    this.cols = [
      { field: 'Stt', header: 'STT', textAlign: 'center', display: 'table-cell', colWith: '10%' },
      { field: 'TieuDe', header: 'Tiêu đề', textAlign: 'left', display: 'table-cell', colWith: '35%' },
      { field: 'CreatedDate', header: 'Thời gian tạo', textAlign: 'center', display: 'table-cell', colWith: '15%' },
      { field: 'SendDate', header: 'Thời gian gửi', textAlign: 'center', display: 'table-cell', colWith: '15%' },
      { field: 'StatusName', header: 'Trạng thái', textAlign: 'left', display: 'table-cell', colWith: '10%' },
      { field: 'Actions', header: 'Tác vụ', textAlign: 'center', display: 'table-cell', colWith: '15%' },
    ];
  }

  applyFilterGlobal() {
    this.myTable.filterGlobal(this.globalFilter?.trim(), 'contains');
  }

  async getMasterData() {
    this.search();
  }

  async search() {
    this.loading = true;

    let fromCreatedDate = this.formatDateService.convertToUTCTime(this.fromCreatedDate);

    let toCreatedDate = this.formatDateService.convertToUTCTime(this.toCreatedDate);

    let fromSendDate = this.formatDateService.convertToUTCTime(this.fromSendDate);

    let toSendDate = this.formatDateService.convertToUTCTime(this.toSendDate);

    let listStatus = this.selectedStatus.map(x => x.value);

    let GetListMessageInput = {
      FromCreatedDate: fromCreatedDate,
      ToCreatedDate: toCreatedDate,
      FromSendDate: fromSendDate,
      ToSendDate: toSendDate,
      ListStatus: listStatus
    }
    
    try {
      let { data, loading }: any = await this.messageAppService.getListMessage(GetListMessageInput);
      this.loading = loading;
      this.listMessage = data.getListMessage.listMessage.map((item) =>
        Object.assign({}, item)
      );
      this.listMessage.forEach(item => {
        item.CreatedDate = new Date(item.CreatedDate);
        item.SendDate = item.SendDate ? new Date(item.SendDate) : null;
      });
    }
    catch (error) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: error };
      this.showMessage(msg);
    }
  }

  refresh() {
    this.fromCreatedDate = null;
    this.toCreatedDate = null;
    this.fromSendDate = null;
    this.toSendDate = null;
    this.selectedStatus = [];
    this.globalFilter = null;
    this.applyFilterGlobal();

    this.search();
  }

  goToCreate() {
    const ref = this.dialogService.open(TinNhanDialogComponent, {
      header: 'Thêm tin nhắn',
      width: '90%',
      baseZIndex: 999,
      data: {
        type: 0, //0: Create, 1: Update
        id: null
      }
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  edit(data: Message) {
    const ref = this.dialogService.open(TinNhanDialogComponent, {
      header: 'Sửa tin nhắn',
      width: '90%',
      baseZIndex: 999,
      data: {
        type: 1, //0: Create, 1: Update
        id: data.Id
      }
    });

    ref.onClose.subscribe(result => {
      if (result) {
        this.search();
      }
    });
  }

  delete(data: Message) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa, dữ liệu sẽ không thể hoàn tác?',
      accept: () => {
        this.messageAppService.deleteMessage(data.Id).subscribe(({data}) => {
          let result: any = data;
    
          if (result.deleteMessage.messageCode == 200) {
            let msg = { severity: 'success', summary: 'Thông báo:', detail: result.deleteMessage.message };
            this.showMessage(msg);

            this.refresh();
          }
          else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.deleteMessage.message };
            this.showMessage(msg);
          }
        }, (error) => {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: error };
          this.showMessage(msg);
        });
      }
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

}