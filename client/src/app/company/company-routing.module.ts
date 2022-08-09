import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guard/auth.guard';
import { CompanyComponent } from './company.component';
import { ListCompanyComponent } from './components/list-company/list-company.component';

const routes: Routes = [{
  path: '', component: CompanyComponent,
  children: [
    {
      path: 'list-company',
      component: ListCompanyComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
