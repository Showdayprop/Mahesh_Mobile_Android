import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyTourPageRoutingModule } from './property-tour-routing.module';

import { PropertyTourPage } from './property-tour.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyTourPageRoutingModule
  ],
  declarations: [PropertyTourPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PropertyTourPageModule {}
