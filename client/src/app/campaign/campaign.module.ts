import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignRoutingModule } from './campaign-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { CampaignComponent } from './campaign.component';
import { CampaignCreateComponent } from './components/campaign-create/campaign-create.component';
import { CampaignDetailComponent } from './components/campaign-detail/campaign-detail.component';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';
import { PreviewCampaignComponent } from './components/preview-campaign/preview-campaign.component';

import { CampaignService } from './services/campaign.service';

@NgModule({
  declarations: [
    CampaignComponent,
    CampaignCreateComponent,
    CampaignDetailComponent,
    CampaignListComponent,
    PreviewCampaignComponent
  ],
  imports: [
    CommonModule,
    CampaignRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    CampaignService
  ]
})
export class CampaignModule { }
