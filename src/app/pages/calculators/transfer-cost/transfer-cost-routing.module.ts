import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransferCostPage } from './transfer-cost.page';

const routes: Routes = [
  {
    path: '',
    component: TransferCostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransferCostPageRoutingModule {}
