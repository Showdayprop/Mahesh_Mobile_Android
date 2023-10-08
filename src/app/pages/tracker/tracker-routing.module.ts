import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';

import { TrackerPage } from './tracker.page';

const routes: Routes = [
  {
    path: '',
    component: TrackerPage,
    children: [
      {
        path: 'list',
        component:ListComponent
      },
      {
        path: 'create',
        component:CreateComponent
      },
      {
        path: 'detail',
        component:DetailComponent
      },
      {
        path: '',
        redirectTo: '/tracker/list',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackerPageRoutingModule {}
