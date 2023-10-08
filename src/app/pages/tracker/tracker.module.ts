import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackerPageRoutingModule } from './tracker-routing.module';

import { TrackerPage } from './tracker.page';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { CreateComponent } from './create/create.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TrackerPageRoutingModule,
    SharedModule
  ],
  declarations: [TrackerPage,
    ListComponent,
    DetailComponent,
    CreateComponent
  ]
})
export class TrackerPageModule {}
