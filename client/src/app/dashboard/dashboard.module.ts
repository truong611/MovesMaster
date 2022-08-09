import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DirectoryComponent } from './components/directory/directory.component';
import { AccountComponent } from './components/account/account.component';
import { NewsComponent } from './components/news/news.component';
import { ReportsComponent } from './components/reports/reports.component';
import { PopupPreviewComponent } from './components/popup-preview/popup-preview.component';
import { IntroduceCompanyComponent } from './components/introduce-company/introduce-company.component';
import { PopupContactComponent } from './components/popup-contact/popup-contact.component';

import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DashboardService } from './services/dashboard.service';
import { NotificationService } from '../shared/services/notification.services';

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    DirectoryComponent,
    AccountComponent,
    NewsComponent,
    ReportsComponent,
    PopupPreviewComponent,
    IntroduceCompanyComponent,
    PopupContactComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DashboardService,
    NotificationService
  ],
})
export class DashboardModule { }
