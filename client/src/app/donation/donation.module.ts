import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { DonationComponent } from './donation.component';
import { ListDonationComponent } from './components/list-donation/list-donation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
  declarations: [
    DonationComponent,
    ListDonationComponent
  ],
  imports: [
    CommonModule,
    DonationRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    CalendarModule,
    DropdownModule
  ]
})
export class DonationModule { }
