import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeviceLogsPage } from './device-logs.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeviceLogsPageRoutingModule {}
