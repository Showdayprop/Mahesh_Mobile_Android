import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalculatorsPageRoutingModule } from './calculators-routing.module';

import { CalculatorsPage } from './calculators.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalculatorsPageRoutingModule,
    SharedModule
  ],
  declarations: [CalculatorsPage]
})
export class CalculatorsPageModule {}
