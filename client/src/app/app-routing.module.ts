import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "./shared/guard/auth.guard";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from "./auth/components/login/login.component";
import { ResetPasswordComponent } from './auth/components/resetPassword/resetPassword.component';
import { SignUpComponent } from './auth/components/sign-up/sign-up.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { PolicyComponent } from './policy/policy.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./un-auth/un-auth.module').then(m => m.UnAuthModule)
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: 'policy',
    component: PolicyComponent
  },
  {
    path: 'appeal',
    canActivate: [AuthGuard],
    loadChildren: () => import('./appeal/appeal.module').then(m => m.AppealModule)
  },
  {
    path: 'campaign',
    canActivate: [AuthGuard],
    loadChildren: () => import('./campaign/campaign.module').then(m => m.CampaignModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'directory',
    canActivate: [AuthGuard],
    loadChildren: () => import('./directory/directory.module').then(m => m.DirectoryModule)
  },
  {
    path: 'news',
    
    loadChildren: () => import('./news/news.module').then(m => m.NewsModule)
  },
  {
    path: 'notification',
    canActivate: [AuthGuard],
    loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)
  },
  {
    path: 'match',
    canActivate: [AuthGuard],
    loadChildren: () => import('./match/match.module').then(m => m.MatchModule)
  },
  {
    path: 'donation',
    canActivate: [AuthGuard],
    loadChildren: () => import('./donation/donation.module').then(m => m.DonationModule)
  },
  {
    path: 'company',
    canActivate: [AuthGuard],
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
  },
  {
    path: 'charity',
    canActivate: [AuthGuard],
    loadChildren: () => import('./charity/charity.module').then(m => m.CharityModule)
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
