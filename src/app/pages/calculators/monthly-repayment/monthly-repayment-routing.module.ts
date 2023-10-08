import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonthlyRepaymentPage } from './monthly-repayment.page';

const routes: Routes = [
  {
    path: '',
    component: MonthlyRepaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthlyRepaymentPageRoutingModule {}
