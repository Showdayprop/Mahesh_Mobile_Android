import { ProvidersListComponent } from './providers-list/providers-list.component';
import { FullSearchComponent } from './../../components/full-search/full-search.component';
import { DashboardComponent } from './dashboard.component';
import { CategoriesComponent } from './categories/categories.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'categories',
        component: CategoriesComponent,
      },
      {
        path: 'search',
        component: FullSearchComponent,
      },
      {
        path: 'providers-list',
        component: ProvidersListComponent
      },
      {
        path: '',
        redirectTo: 'categories'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule { }
