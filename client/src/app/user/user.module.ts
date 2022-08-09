import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';

import { UserComponent } from './user.component';
import { ListUserComponent } from './components/list-user/list-user.component';
import { DetailUserComponent } from './components/detail-user/detail-user.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

import { UserService } from './services/user.service';
import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    UserComponent,
    ListUserComponent,
    DetailUserComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule
  ],
  providers: [
    UserService,
    DataService
  ],
})
export class UserModule { }
