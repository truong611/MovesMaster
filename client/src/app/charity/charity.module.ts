import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CharityRoutingModule } from './charity-routing.module';
import { CharityComponent } from './charity.component';
import { ListCharityComponent } from './components/list-charity/list-charity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PopupListcharityComponent } from './components/popup-listcharity/popup-listcharity.component';
import { ListCharityRecommentComponent } from './components/list-charity-recomment/list-charity-recomment.component';

import { CharityService } from './services/charity.service';


@NgModule({
  declarations: [
    CharityComponent,
    ListCharityComponent,
    PopupListcharityComponent,
    ListCharityRecommentComponent
  ],
  imports: [
    CommonModule,
    CharityRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    CharityService
  ]
})
export class CharityModule { }
