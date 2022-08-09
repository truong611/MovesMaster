import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';
import { ListCompanyComponent } from './components/list-company/list-company.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PopupListcompanyComponent } from './components/popup-listcompany/popup-listcompany.component';

import { CompanyService } from './services/company.service';

@NgModule({
  declarations: [
    CompanyComponent,
    ListCompanyComponent,
    PopupListcompanyComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    CompanyService
  ],
})
export class CompanyModule { }
