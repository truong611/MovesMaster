import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';

import { NewsComponent } from './news.component';
import { ListNewComponent } from './components/list-new/list-new.component';
import { CreateNewComponent } from './components/create-new/create-new.component';
import { DetailNewComponent } from './components/detail-new/detail-new.component';

const routes: Routes = [
  {
    path: '',
    component: NewsComponent,
    children: [
      {
        path: 'create-new',
        component: CreateNewComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'detail-new',
        component: DetailNewComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'list-new',
        component: ListNewComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
