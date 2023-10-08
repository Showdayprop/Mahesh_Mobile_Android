import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonthlyRepaymentPageRoutingModule } from './monthly-repayment-routing.module';

import { MonthlyRepaymentPage } from './monthly-repayment.page';
import { SharedModule } from '../../../shared/shared.module';
import { MaterialModule } from '../../../material.module';
import { MatDividerModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonthlyRepaymentPageRoutingModule,
    SharedModule,
    MaterialModule,
    MatDividerModule
  ],
  declarations: [MonthlyRepaymentPage],
  providers: [DecimalPipe]
})
export class MonthlyRepaymentPageModule {}
