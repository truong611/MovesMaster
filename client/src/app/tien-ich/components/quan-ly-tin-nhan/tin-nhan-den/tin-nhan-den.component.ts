import { Component, OnInit } from '@angular/core';
import { MessageAppService } from '../../../services/message-app.service';
import { MessageService } from 'primeng/api';
import { HandleFileService } from '../../../../shared/services/handleFile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tin-nhan-den',
  templateUrl: './tin-nhan-den.component.html',
  styleUrls: ['./tin-nhan-den.component.css']
})
export class TinNhanDenComponent implements OnInit {
  loading: boolean = false;
  keyword: string = null;
  listMessage: Array<any> = [];
  message: any;
  display: boolean = false;

  constructor(
    public messageAppService: MessageAppService,
    public messageService: MessageService,
    public handleFileService: HandleFileService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getMasterData();
  }

  async getMasterData() {
    this.search();
  }

  async search() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.messageAppService.getListMessageByUserId(this.keyword?.trim());
      this.loading = loading;
      
      if (data?.getListMessageByUserId?.messageCode == 200) {
        this.listMessage = data?.getListMessageByUserId?.listMessage.map((item) =>
          Object.assign({}, item)
        );
      }
      else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: data?.getListMessageByUserId?.message };
        this.showMessage(msg);
      }
    }
    catch (e) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: e };
      this.showMessage(msg);
    }
  }

  refresh() {
    this.keyword = null;
    this.search();
  }

  downloadFile(Id: number, TenTaiLieu: string) {
    this.messageAppService.downloadFileMess(Id).subscribe(async ({ data }) => {
      let result: any = data;

      if (result.downloadFileMess.messageCode == 200) {
        let base64 = result.downloadFileMess.base64;
        let type = result.downloadFileMess.type;
        this.handleFileService.saveFile(base64, type, TenTaiLieu);
      }
      else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.downloadFileMess.message };
        this.showMessage(msg);
      }
    }, (error) => {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: error };
      this.showMessage(msg);
    });
  }

  cssTieuDe(daXem: boolean) {
    if (daXem) return 'tieu-de-da-xem'
    else return 'tieu-de-chua-xem'
  }

  cssNoiDung(daXem: boolean) {
    if (daXem) return 'noi-dung-da-xem'
    else return 'noi-dung-chua-xem'
  }

  showDetail(message: any) {
    this.message = message;
    this.message.DaXem = true;

    this.messageAppService.xemMessage(this.message.Id).subscribe(async ({ data }) => {
      let result: any = data;

      if (result.xemMessage.messageCode == 200) {
        this.display = true;
      }
      else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.xemMessage.message };
        this.showMessage(msg);
      }
    }, (error) => {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: error };
      this.showMessage(msg);
    });
  }

  cancel() {
    this.display = false;
    this.message = null;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

}
