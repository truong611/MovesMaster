import { HomeComponent } from './components/home/home.component';
import { NewsTemplateComponent } from './components/news-template/news-template.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnAuthRoutingModule } from './un-auth-routing.module';
import { UnAuthComponent } from './un-auth.component';

import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { DashboardAccountComponent } from './components/home-dashboard/dashboard-account/dashboard-account.component';
import { DashboardDirectoryComponent } from './components/home-dashboard/dashboard-directory/dashboard-directory.component';
import { DashboardNewsComponent } from './components/home-dashboard/dashboard-news/dashboard-news.component';
import { DashboardProfileComponent } from './components/home-dashboard/dashboard-profile/dashboard-profile.component';
import { DashboardReportsComponent } from './components/home-dashboard/dashboard-reports/dashboard-reports.component';
import { HomeWhoWeAreComponent } from './components/home-who-we-are/home-who-we-are.component';
import { HomeWorksComponent } from './components/home-works/home-works.component';
import { HomePerformanceComponent } from './components/home-performance/home-performance.component';
import { HomeNewsComponent } from './components/home-news/home-news.component';
import { HomeDirectoryComponent } from './components/home-directory/home-directory.component';

import { DashboardService } from '../dashboard/services/dashboard.service';

@NgModule({
  declarations: [
    UnAuthComponent,
    NewsTemplateComponent,
    HomeComponent,
    HomeDashboardComponent,
    DashboardAccountComponent,
    DashboardDirectoryComponent,
    DashboardNewsComponent,
    DashboardProfileComponent,
    DashboardReportsComponent,
    HomeWhoWeAreComponent,
    HomeWorksComponent,
    HomePerformanceComponent,
    HomeNewsComponent,
    HomeDirectoryComponent,
  ],
  imports: [
    CommonModule,
    UnAuthRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DashboardService
  ],
  exports: [
    HomeComponent,
    HomeWhoWeAreComponent,
    HomeWorksComponent,
    HomePerformanceComponent,
    HomeNewsComponent,
    HomeDirectoryComponent,
  ]
})
export class UnAuthModule { }
