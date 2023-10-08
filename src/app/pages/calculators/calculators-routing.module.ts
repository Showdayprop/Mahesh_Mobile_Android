import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalculatorsPage } from './calculators.page';

const routes: Routes = [
  {
    path: '',
    component: CalculatorsPage,
  },
  {
    path: 'transfer-cost',
    loadChildren: () => import('./transfer-cost/transfer-cost.module').then(m => m.TransferCostPageModule)
  },
  {
    path: 'monthly-repayment',
    loadChildren: () => import('./monthly-repayment/monthly-repayment.module').then(m => m.MonthlyRepaymentPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalculatorsPageRoutingModule { }
