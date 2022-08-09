import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from "@angular/router";
import { QuanLyThongBaoService } from '../../services/quan-ly-thong-bao.service';
import { ThongBao, ThongBaoInput } from '../../models/quan-ly-thong-bao.model';
import { stringify } from 'querystring';

@Component({
  selector: 'app-quan-ly-thong-bao',
  templateUrl: './quan-ly-thong-bao.component.html',
  styleUrls: ['./quan-ly-thong-bao.component.css']
})
export class QuanLyThongBaoComponent implements OnInit {
  loading: boolean = false;
  globalFilter: string = null;
  selectedPhanLoai: any = null;
  listThongBao: Array<ThongBao> = [];
  thongBao: ThongBao = new ThongBao();
  displayModal: boolean = false;

  constructor(
    public messageService: MessageService,
    public dialogService: DialogService,
    public quanLyThongBaoService: QuanLyThongBaoService,
    public confirmationService: ConfirmationService,
    public router: Router,
  ) {
  }

  ngOnInit(): void {
    // Get list thông báo
    this.getListData();
  }

  async getListData() {
    try {
      this.loading = true;
      let { data, loading }: any = await this.quanLyThongBaoService.getThongBaoByUserId(this.globalFilter);
      this.loading = loading;

      if (data.getThongBaoByUserId.messageCode == 200) {
        this.listThongBao = data.getThongBaoByUserId.listThongBao;
      }
      else {
        this.showMessage('error', data.getThongBaoByUserId.message);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  refresh() {
    this.selectedPhanLoai = null;
    this.globalFilter = null;
    this.getListData();
  }

  showBasicDialog(item) {
    this.updateNoti(item);
    this.displayModal = true;
  }

  async updateNoti(item) {
    try {
      this.thongBao.Id = item.Id;
      this.thongBao.TieuDe = item.TieuDe;
      this.thongBao.NoiDung = item.NoiDung;
      this.thongBao.DaXem = item.DaXem;
      this.thongBao.PageUrl = item.PageUrl;
      this.thongBao.ParamsUrl = item.ParamsUrl;
      this.thongBao.NguoiDung_Id = item.NguoiDung_Id;
      this.thongBao.CreatedDate = item.CreatedDate;

      this.loading = true;
      let { data }: any = await this.quanLyThongBaoService.updateThongBao(this.thongBao.Id);
      this.loading = false;

      await this.getListData();
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  async goToView(item) {
    this.displayModal = false;
    await this.updateNoti(item);

    if (item.ParamsUrl != null && item.ParamsUrl?.trim() != '') {
      let objParam = JSON.parse(item.ParamsUrl);
      this.router.navigate([item.PageUrl, objParam]);
    }
    else {
      this.router.navigate([item.PageUrl]);
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail, sticky:false };
    if(severity == 'error') {
      msg.sticky = true;
    }
    this.messageService.add(msg);
  }
}
