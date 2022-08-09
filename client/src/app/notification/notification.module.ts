import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { NotificationRoutingModule } from './notification-routing.module';

import { NotificationComponent } from './notification.component';
import { ListNotificationComponent } from './components/list-notification/list-notification.component';
import { DetailNotificationComponent } from './components/detail-notification/detail-notification.component';


@NgModule({
  declarations: [
    NotificationComponent,
    ListNotificationComponent,
    DetailNotificationComponent
  ],
  imports: [
    CommonModule,
    NotificationRoutingModule,
    SharedModule
  ],
  exports: [
    DetailNotificationComponent
  ]
})
export class NotificationModule { }
