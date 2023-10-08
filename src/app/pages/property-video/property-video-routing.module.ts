import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropertyVideoPage } from './property-video.page';

const routes: Routes = [
  {
    path: '',
    component: PropertyVideoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyVideoPageRoutingModule {}
