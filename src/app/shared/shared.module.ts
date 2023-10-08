import { PhotosPermissionComponent } from './../components/photos-permission/photos-permission.component';
import { ImageSliderComponent } from './../components/image-slider/image-slider.component';
import { ImageUploadComponent } from './../components/image-upload/image-upload.component';
import { FormatNumberPipe } from './../pipes/format-number.pipe';
import { ImageurlPipe } from './../pipes/imageurl.pipe';
import { ExpansionListComponent } from './../components/expansion-list/expansion-list.component';
import { ProviderDetailComponent } from './../pages/dashboard/provider-detail/provider-detail.component';
import { ConfigureEventComponent } from './../components/configure-event/configure-event.component';
import { FavComponent } from './../components/fav/fav.component';
import { MultipleImgCaptureComponent } from './../pages/seller/multiple-img-capture/multiple-img-capture.component';
import { UploadCoordinatesComponent } from './../pages/seller/uploadCoordinates/uploadCoordinates.component';
import { ShowdaysCaptureComponent } from './../components/showdays-capture/showdays-capture.component';
import { SearchPopoverListComponent } from './../components/search-popover-list/search-popover-list.component';
import { GoogleMapsComponent } from './../components/google-maps/google-maps.component';
import { FormatDatePipe } from './../pipes/format-date.pipe';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Common } from './common';
import { PropertyItemComponent } from '../components/property-item/property-item.component';
import { ImageGalleryComponent } from '../components/image-gallery/image-gallery.component';
// import filepond module
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
registerPlugin(FilePondPluginImagePreview);
// import { MbscModule } from '@mobiscroll/angular';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { CalendarEventsComponent } from '../components/calendar-events/calendar-events.component';
import { VerificationStatusPopoverComponent } from '../components/verification-status-popover/verification-status-popover.component';
import { CreateBookingComponent } from '../components/create-booking/create-booking.component';

/**
 * Shares common components, directives, and pipes that
 * may not be as application specific.
 */
@NgModule({
  entryComponents: [SearchPopoverListComponent,
    ShowdaysCaptureComponent,
    UploadCoordinatesComponent,
    MultipleImgCaptureComponent,
    ImageGalleryComponent,
    FavComponent,
    CalendarEventsComponent,
    ConfigureEventComponent,
    ProviderDetailComponent,
    ExpansionListComponent,
    VerificationStatusPopoverComponent,
    CreateBookingComponent,
    ImageUploadComponent,
    ImageSliderComponent,
    PhotosPermissionComponent],
  declarations: [FormatDatePipe,
    PropertyItemComponent,
    GoogleMapsComponent,
    SearchPopoverListComponent,
    ShowdaysCaptureComponent,
    UploadCoordinatesComponent,
    MultipleImgCaptureComponent,
    ImageGalleryComponent,
    FavComponent,
    CalendarEventsComponent,
    ConfigureEventComponent,
    ProviderDetailComponent,
    ExpansionListComponent,
    ImageurlPipe,
    FormatNumberPipe,
    VerificationStatusPopoverComponent,
    CreateBookingComponent,
    ImageUploadComponent,
    ImageSliderComponent,
    PhotosPermissionComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FilePondModule,
    // MbscModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormatDatePipe,
    PropertyItemComponent,
    GoogleMapsComponent,
    SearchPopoverListComponent,
    ShowdaysCaptureComponent,
    UploadCoordinatesComponent,
    MultipleImgCaptureComponent,
    ImageGalleryComponent,
    FavComponent,
    CalendarEventsComponent,
    ConfigureEventComponent,
    ExpansionListComponent,
    ImageurlPipe,
    FormatNumberPipe,
    VerificationStatusPopoverComponent,
    CreateBookingComponent,
    ImageUploadComponent,
    ImageSliderComponent,
    PhotosPermissionComponent
  ],
  providers: [
    Common,
    FormatDatePipe,
    ImageurlPipe,
    FormatNumberPipe,
    TitleCasePipe,
  ]
})
export class SharedModule { }
