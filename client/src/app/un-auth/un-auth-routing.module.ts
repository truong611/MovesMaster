import { UnAuthComponent } from './un-auth.component';
import { NewsTemplateComponent } from './components/news-template/news-template.component';
import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { HomeWhoWeAreComponent } from './components/home-who-we-are/home-who-we-are.component';
import { HomeWorksComponent } from './components/home-works/home-works.component';
import { HomePerformanceComponent } from './components/home-performance/home-performance.component';
import { HomeNewsComponent } from './components/home-news/home-news.component';
import { HomeDirectoryComponent } from './components/home-directory/home-directory.component';
import { ListAppealComponent } from './components/list-appeal/list-appeal.component';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';
import { ListDonationComponent } from './components/list-donation/list-donation.component';
import { MatchListComponent } from './components/match-list/match-list.component';


const routes: Routes = [{
  path: '', component: UnAuthComponent,
  children: [
    {
      path: 'home',
      component: HomeComponent,
    },
    {
      path: 'home-who-we-are',
      component: HomeWhoWeAreComponent,
    },
    {
      path: 'home-works',
      component: HomeWorksComponent,
    },
    {
      path: 'home-performance',
      component: HomePerformanceComponent,
    },
    {
      path: 'home-news',
      component: HomeNewsComponent,
    },
    {
      path: 'home-directory',
      component: HomeDirectoryComponent,
    },
    {
      path: 'news-template',
      component: NewsTemplateComponent,
    },
    {
      path: 'home-dashboard',
      component: HomeDashboardComponent,
    },
    {
      path: 'home-list-appeal',
      component: ListAppealComponent,
    },
    {
      path: 'home-list-campaign',
      component: CampaignListComponent,
    },
    {
      path: 'home-list-donation',
      component: ListDonationComponent,
    },
    {
      path: 'home-list-match',
      component: MatchListComponent,
    },
  ]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UnAuthRoutingModule { }
