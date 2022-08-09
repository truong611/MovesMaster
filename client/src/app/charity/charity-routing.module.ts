import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { CharityComponent } from './charity.component';
import { ListCharityComponent } from './components/list-charity/list-charity.component';
import { ListCharityRecommentComponent } from './components/list-charity-recomment/list-charity-recomment.component';

const routes: Routes = [{
  path: '', component: CharityComponent,
  children: [
    {
      path: 'list-charity',
      component: ListCharityComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'list-charity-recomment',
      component: ListCharityRecommentComponent,
      canActivate: [AuthGuard]
    }
  ]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CharityRoutingModule { }
