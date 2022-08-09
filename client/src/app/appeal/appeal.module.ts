import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppealRoutingModule } from './appeal-routing.module';
import { ProgressBarModule } from 'primeng/progressbar';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AppealComponent } from './appeal.component';
import { CreateAppealComponent } from './component/create-appeal/create-appeal.component';
import { DetailAppealComponent } from './component/detail-appeal/detail-appeal.component';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ListAppealComponent } from './component/list-appeal/list-appeal.component';
import { PreviewAppealComponent } from './component/preview-appeal/preview-appeal.component';


@NgModule({
  declarations: [
    AppealComponent,
    CreateAppealComponent,
    DetailAppealComponent,
    ListAppealComponent,
    PreviewAppealComponent
  ],
  imports: [
    CommonModule,
    AppealRoutingModule,
    ProgressBarModule,
    CalendarModule,
    CheckboxModule,
    InputTextModule,
    FileUploadModule,
    HttpClientModule,
    ProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AppealModule { }
