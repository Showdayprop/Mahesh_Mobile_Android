import { BookingService } from './../../../providers/booking.service';
import { PropertiesService } from './../../../providers/properties.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent implements OnInit {
  propertyData: any;
  bookingEventData: any;
  constructor(private propertiesSrvc: PropertiesService,
    private bookingSrvc: BookingService) {
    this.propertyData = this.propertiesSrvc.propertyDetail.getValue();
    this.bookingEventData = this.bookingSrvc.bookingEventData.getValue()
    // debugger
  }

  ngOnInit() { }

}
