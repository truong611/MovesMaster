import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { TienIchComponent } from './tien-ich.component';
import { TinNhanComponent } from './components/quan-ly-tin-nhan/tin-nhan/tin-nhan.component';
import { TinNhanDenComponent } from './components/quan-ly-tin-nhan/tin-nhan-den/tin-nhan-den.component';
import { QuanLyThongBaoComponent } from './components/quan-ly-thong-bao/quan-ly-thong-bao.component';

const routes: Routes = [
  {
    path: '',
    component: TienIchComponent,
    children: [
      {
        path: 'quan-ly-thong-bao',
        component: QuanLyThongBaoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'tin-nhan',
        component: TinNhanComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'tin-nhan-den',
        component: TinNhanDenComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TienIchRoutingModule { }
