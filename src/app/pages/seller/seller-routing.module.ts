import { DraftComponent } from './draft/draft.component';
import { LiveComponent } from './live/live.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SellerPage } from './seller.page';

const routes: Routes = [
  {
    path: '',
    component: SellerPage,
    children: [
      {
        path: 'live',
        component:LiveComponent
      },
      {
        path: 'draft',
        component:DraftComponent
      },
      {
        path: '',
        redirectTo: '/seller/live',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'add-url',
    loadChildren: () => import('./add-url/add-url.module').then( m => m.AddUrlPageModule)
  },
  {
    path: 'detailed-listing',
    loadChildren: () => import('./detailed-listing/detailed-listing.module').then( m => m.DetailedListingPageModule)
  },
  { path: 'property-detail', loadChildren: () => import('../../pages/property-map/property-map.module').then( m => m.PropertyMapModule)},
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then( m => m.AttendancePageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellerPageRoutingModule {}
