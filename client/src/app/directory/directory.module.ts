import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { DirectoryRoutingModule } from './directory-routing.module';
import { DirectoryComponent } from './directory.component';

@NgModule({
  declarations: [
    DirectoryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DirectoryRoutingModule
  ]
})
export class DirectoryModule { }
