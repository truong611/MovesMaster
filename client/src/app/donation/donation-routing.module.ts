import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { ListDonationComponent } from './components/list-donation/list-donation.component';
import { DonationComponent } from './donation.component';

const routes: Routes = [{
  path: '', component: DonationComponent,
  children: [
    {
      path: 'list-donation',
      component: ListDonationComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonationRoutingModule { }
