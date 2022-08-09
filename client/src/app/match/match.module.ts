import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatchRoutingModule } from './match-routing.module';
import { MatchComponent } from './match.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatchListComponent } from './components/match-list/match-list.component';
import { SharedModule } from '../shared/shared.module';
import { CheckboxModule } from 'primeng/checkbox';


@NgModule({
  declarations: [
    MatchComponent,
    MatchListComponent,
  ],
  imports: [
    CommonModule,
    MatchRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    CheckboxModule
  ]
})
export class MatchModule { }
