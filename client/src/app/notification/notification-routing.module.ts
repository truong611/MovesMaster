import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { NotificationComponent } from './notification.component';
import { ListNotificationComponent } from './components/list-notification/list-notification.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationComponent,
    children: [
      {
        path: 'list',
        component: ListNotificationComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule { }
