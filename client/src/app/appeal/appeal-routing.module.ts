import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { AppealComponent } from './appeal.component';
import { CreateAppealComponent } from './component/create-appeal/create-appeal.component';
import { DetailAppealComponent } from './component/detail-appeal/detail-appeal.component';
import { ListAppealComponent } from './component/list-appeal/list-appeal.component';

const routes: Routes = [
  {
    path: '',
    component: AppealComponent,
    children: [
      {
        path: 'create-appeal',
        component: CreateAppealComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'detail-appeal',
        component: DetailAppealComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'list-appeal',
        component: ListAppealComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppealRoutingModule { }
