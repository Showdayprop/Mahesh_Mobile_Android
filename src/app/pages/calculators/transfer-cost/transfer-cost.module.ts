import { TransferCostPage } from './transfer-cost.page';
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransferCostPageRoutingModule } from './transfer-cost-routing.module';

import { SharedModule } from '../../../shared/shared.module';
import { MatDividerModule } from '@angular/material';
import { MaterialModule } from '../../../material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferCostPageRoutingModule,
    SharedModule,
    MaterialModule,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  declarations: [TransferCostPage],
  providers: [DecimalPipe]
})
export class TransferCostPageModule { }
