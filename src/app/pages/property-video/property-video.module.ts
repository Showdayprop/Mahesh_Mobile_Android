import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyVideoPageRoutingModule } from './property-video-routing.module';

import { PropertyVideoPage } from './property-video.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyVideoPageRoutingModule
  ],
  declarations: [PropertyVideoPage]
})
export class PropertyVideoPageModule {}
