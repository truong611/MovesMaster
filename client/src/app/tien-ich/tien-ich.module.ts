import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TienIchRoutingModule } from './tien-ich-routing.module';

import { ValidaytorsService } from '../shared/services/validaytors.service';
import { FormatDateService } from '../shared/services/formatDate.services';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageAppService } from './services/message-app.service';
import { HandleFileService } from '../shared/services/handleFile.service';

import { TienIchComponent } from './tien-ich.component';
import { TinNhanComponent } from './components/quan-ly-tin-nhan/tin-nhan/tin-nhan.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TinNhanDialogComponent } from './components/quan-ly-tin-nhan/tin-nhan-dialog/tin-nhan-dialog.component';
import { TinNhanDenComponent } from './components/quan-ly-tin-nhan/tin-nhan-den/tin-nhan-den.component';
import { QuanLyThongBaoComponent } from './components/quan-ly-thong-bao/quan-ly-thong-bao.component';
import { QuanLyThongBaoService } from './services/quan-ly-thong-bao.service';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    TienIchComponent,
    QuanLyThongBaoComponent,
    TinNhanComponent,
    TinNhanDialogComponent,
    TinNhanDenComponent
  ],
  imports: [
    CommonModule,
    TienIchRoutingModule,
    SharedModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    MessageAppService,
    ValidaytorsService,
    FormatDateService,
    HandleFileService,
    QuanLyThongBaoService,
  ],
  entryComponents: [
    TinNhanDialogComponent
  ]
})
export class TienIchModule { }
