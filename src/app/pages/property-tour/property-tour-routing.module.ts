import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropertyTourPage } from './property-tour.page';

const routes: Routes = [
  {
    path: '',
    component: PropertyTourPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyTourPageRoutingModule {}
