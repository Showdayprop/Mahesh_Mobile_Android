import { SharedModule } from './../../../shared/shared.module';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetailedListingPageRoutingModule } from './detailed-listing-routing.module';
import { DetailedListingPage } from './detailed-listing.page';
// import { MbscModule } from '@mobiscroll/angular';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

@NgModule({
  entryComponents: [PropertyInfoComponent,],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailedListingPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    // MbscModule,
    HttpClientModule, HttpClientJsonpModule
  ],
  declarations: [DetailedListingPage, PropertyInfoComponent]
})
export class DetailedListingPageModule { }
