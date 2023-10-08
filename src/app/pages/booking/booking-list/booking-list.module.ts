import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookingListPageRoutingModule } from './booking-list-routing.module';

import { BookingListPage } from './booking-list.page';
import { MatStepperModule } from '@angular/material/stepper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookingListPageRoutingModule,
    MatStepperModule
  ],
  declarations: [BookingListPage]
})
export class BookingListPageModule { }
