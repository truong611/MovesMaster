import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NewsRoutingModule } from './news-routing.module';

import { NewsService } from './services/news.service';

import { NewsComponent } from './news.component';
import { ListNewComponent } from './components/list-new/list-new.component';
import { CreateNewComponent } from './components/create-new/create-new.component';
import { DetailNewComponent } from './components/detail-new/detail-new.component';
import { PreviewNewComponent } from './components/preview-new/preview-new.component';


@NgModule({
  declarations: [
    NewsComponent,
    ListNewComponent,
    CreateNewComponent,
    DetailNewComponent,
    PreviewNewComponent
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    NewsService
  ],
})
export class NewsModule { }
