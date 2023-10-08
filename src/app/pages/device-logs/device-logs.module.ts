import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeviceLogsPageRoutingModule } from './device-logs-routing.module';

import { DeviceLogsPage } from './device-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeviceLogsPageRoutingModule
  ],
  declarations: [DeviceLogsPage]
})
export class DeviceLogsPageModule {}
