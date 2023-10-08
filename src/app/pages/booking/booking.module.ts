import { MaterialModule } from './../../material.module';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { SharedModule } from './../../shared/shared.module';
import { BookingRoutingModule } from './booking-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatDividerModule } from '@angular/material';



@NgModule({
  entryComponents: [BookingFormComponent],
  declarations: [BookingFormComponent],
  imports: [
    CommonModule,
    BookingRoutingModule,
    FormsModule,
    IonicModule,
    SharedModule,
    MaterialModule,
    MatDividerModule
  ]
})
export class BookingModule { }
