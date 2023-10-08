import { MultipleImgCaptureComponent } from './../multiple-img-capture/multiple-img-capture.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailedListingPage } from './detailed-listing.page';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { UploadCoordinatesComponent } from '../uploadCoordinates/uploadCoordinates.component';
import { CalendarEventsComponent } from '../../../components/calendar-events/calendar-events.component';

const routes: Routes = [
  {
    path: '',
    component: DetailedListingPage
  },
  {
    path: 'showday-events',
    component: CalendarEventsComponent
  },
  {
    path: 'property-info',
    component: PropertyInfoComponent
  },
  {
    path: 'upload-coordinates',
    component: UploadCoordinatesComponent
  },
  {
    path: 'upload-multiple-images',
    component: MultipleImgCaptureComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailedListingPageRoutingModule { }
