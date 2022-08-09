import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { CampaignComponent } from './campaign.component';
import { CampaignCreateComponent } from './components/campaign-create/campaign-create.component';
import { CampaignDetailComponent } from './components/campaign-detail/campaign-detail.component';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignComponent,
    children: [
      {
        path: 'campaign-create',
        component: CampaignCreateComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'campaign-detail',
        component: CampaignDetailComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'campaign-list',
        component: CampaignListComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }
