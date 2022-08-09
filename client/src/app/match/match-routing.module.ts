import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { MatchListComponent } from './components/match-list/match-list.component';
import { MatchComponent } from './match.component';

const routes: Routes = [{
  path: '', component: MatchComponent,
  children: [
    {
      path: 'match-list',
      component: MatchListComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchRoutingModule { }
