import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../core/logger.service';
import { BookingService } from '../../providers/booking.service';
import { CameraHelperService } from '../../providers/camera-helper.service';
import { PropertiesService } from '../../providers/properties.service';
import { UserManagementService } from '../../providers/user-management.service';
import { UtilityService } from '../../providers/utilities.service';
import { Common } from '../../shared/common';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

  bookings = [];
  bookingForm: FormGroup;
  propertId;
  userData;
  pageSubscriptions = new Subscription();
  propertyData;
  showdayId;
  imgSrc;
  image;
  showday;
  type;
  bookingTrial = 0;

  constructor(
    public navCtrl: NavController,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private bookingService: BookingService,
    private userMgmtSrvc: UserManagementService,
    private logger: LoggerService,
    private common: Common,
    private utilitySrvc: UtilityService,
    private activatedRoute: ActivatedRoute,
    private propertySrvc: PropertiesService,
    private cameraHlprSrvc: CameraHelperService,
    private domSanitizer: DomSanitizer,
    private navParams: NavParams,
    private modalCtrl: ModalController,
  ) {
    this.showdayId = this.navParams.get('id');
    this.type = this.navParams.get('type');
    this.userData = this.userMgmtSrvc.user.getValue();
    this.pageSubscriptions.add(this.propertySrvc.propertyDetail.subscribe((data: any) => {
      console.log(data)
      this.propertyData = data;
      if (data && data.id) {
        this.propertId = data.id;
        this.logger.log("PropertyMapPage : constructor : data received : ", this.propertId);
        this.getShowday(this.showdayId);
      }
      else {
        this.logger.error("PropertyMapPage : constructor : empty data ");
      }
    }))
  }

  ngOnInit() {
    if (this.type == 'Pre-Booking') {
      this.bookingForm = this.formBuilder.group({
        is_foreigner: [false],
        south_african_id: [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(13), Validators.maxLength(13),])],
        number_of_attendees: [null, Validators.compose([Validators.required])],
        attendee_firstname: [null, Validators.compose([Validators.required])],
        attendee_surname: [null],
        mobile_number: [null, Validators.compose([Validators.required, Validators.minLength(10), , Validators.maxLength(10)])],
      });
      this.bookingForm.get('is_foreigner').setValue(0);
      this.bookingForm.get('number_of_attendees').setValue(1);
      const south_african_id = this.bookingForm.get('south_african_id');
      this.bookingForm.get('is_foreigner').valueChanges
        .subscribe(value => {
          let passport_image = this.bookingForm.get('passport_image');
          if (value) {
            south_african_id.clearValidators();
            if (passport_image) {
              passport_image.setValidators([Validators.compose([Validators.required])]);
            } else {
              this.bookingForm.addControl("passport_image", new FormControl('', Validators.required))
            }
          } else {
            south_african_id.setValidators([Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(13), Validators.maxLength(13),])]);
            if (passport_image) {
              passport_image.clearValidators();
            }
          }
          south_african_id.updateValueAndValidity();
          if (passport_image) {
            passport_image.updateValueAndValidity();
          }
        });
    }
    if (this.type == 'Walk-In') {
      this.bookingForm = this.formBuilder.group({
        is_foreigner: [false],
        south_african_id: [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(13), Validators.maxLength(13),])],
        number_of_attendees: [null, Validators.compose([Validators.required])],
        attendee_firstname: [null, Validators.compose([Validators.required])],
        attendee_surname: [null],
        mobile_number: [null, Validators.compose([Validators.required, Validators.minLength(10)])],
      });
      this.bookingForm.get('mobile_number').setValue(0);
      this.bookingForm.get('is_foreigner').setValue(0);
      this.bookingForm.get('number_of_attendees').setValue(1);
      const south_african_id = this.bookingForm.get('south_african_id');
      let passport_number = this.bookingForm.get('passport_number');
      this.bookingForm.get('is_foreigner').valueChanges
        .subscribe(value => {
          if (value) {
            south_african_id.clearValidators();
            if (passport_number) {
              passport_number.setValidators([Validators.compose([Validators.required])]);
            } else {
              this.bookingForm.addControl("passport_number", new FormControl('', Validators.required))
            }
          } else {
            south_african_id.setValidators([Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(13), Validators.maxLength(13),])]);
            if (passport_number) {
              passport_number.clearValidators();
            }
          }
          south_african_id.updateValueAndValidity();
          if (passport_number) {
            passport_number.updateValueAndValidity();
          }
        });
    }
  }

  get getBookingForm() { return this.bookingForm.controls; }

  getShowday(id) {
    this.propertyData.showdays.forEach(showday => {
      if (showday.id == id) {
        this.showday = showday;
      }
    });
  }

  bookNowPreBooking() {
    this.common.presentLoader();
    if (!this.userData.isLoggedIn) {
      this.common.dismissLoader();
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    } else {
      this.bookingTrial++
      if (this.image) {
        let form_data = {
          "showday_id": this.showdayId,
          "agent_id": this.showday.agent_id,
          "property_id": this.propertId,
          "south_african_id": this.bookingForm.get('south_african_id').value,
          "is_foreigner": this.bookingForm.get('is_foreigner').value,
          "number_of_attendees": this.bookingForm.get('number_of_attendees').value,
          "attendee_firstname": this.bookingForm.get('attendee_firstname').value,
          "attendee_surname": this.bookingForm.get('attendee_surname').value,
          "imagePath": this.image.path,
          "mobile_number": this.bookingForm.get('mobile_number').value,
        }
        this.bookingService.createBookingRequestWithPassport(form_data).then(
          res => {
            this.common.dismissLoader();
            this.bookingForm.reset();
            this.common.presentToast('Booking created successfully.')
            this.modalCtrl.dismiss(true);
          },
          error => {
            this.common.dismissLoader();
            this.bookingForm.reset();
            this.common.presentToast('Unable to create booking.')
            this.modalCtrl.dismiss(false);
          }
        )
      } else {
        let form_data = {
          "showday_id": this.showdayId,
          "agent_id": this.showday.agent_id,
          "property_id": this.propertId,
          "south_african_id": this.bookingForm.get('south_african_id').value,
          "is_foreigner": this.bookingForm.get('is_foreigner').value,
          "number_of_attendees": this.bookingForm.get('number_of_attendees').value,
          "attendee_firstname": this.bookingForm.get('attendee_firstname').value,
          "attendee_surname": this.bookingForm.get('attendee_surname').value,
          "mobile_number": this.bookingForm.get('mobile_number').value,
          "booking_trial": this.bookingTrial,
        }
        this.bookingService.createBookingRequest(form_data).toPromise().then(
          res => {
            this.bookingTrial = 0;
            this.common.dismissLoader();
            this.bookingForm.reset();
            this.common.presentPopupAlertForOK("Your booking is confirmed.");
            this.modalCtrl.dismiss(true);
          },
          error => {
            this.common.dismissLoader();
            if (error.error == "ID verification failed.") {
              this.common.presentPopupAlertForOK("Provided Id does not match. Please try again with correct details.");
            } else {
              this.common.presentToast('Unable to create booking.')
              this.modalCtrl.dismiss(false);
              this.bookingForm.reset();
            }
          }
        )
      }
    }
  }

  bookNowWalkIn() {
    this.common.presentLoader();
    if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    } else {
      this.bookingTrial++
      let form_data;
      if (this.bookingForm.get('is_foreigner').value) {
        form_data = {
          "showday_id": this.showdayId,
          "agent_id": this.userData.id,
          "property_id": this.propertId,
          "is_foreigner": this.bookingForm.get('is_foreigner').value,
          "number_of_attendees": this.bookingForm.get('number_of_attendees').value,
          "attendee_firstname": this.bookingForm.get('attendee_firstname').value,
          "attendee_surname": this.bookingForm.get('attendee_surname').value,
          "mobile_number": this.bookingForm.get('mobile_number').value,
          "passport_number": this.bookingForm.get('passport_number').value,
        }
      } else {
        form_data = {
          "showday_id": this.showdayId,
          "agent_id": this.userData.id,
          "property_id": this.propertId,
          "south_african_id": this.bookingForm.get('south_african_id').value,
          "is_foreigner": this.bookingForm.get('is_foreigner').value,
          "number_of_attendees": this.bookingForm.get('number_of_attendees').value,
          "attendee_firstname": this.bookingForm.get('attendee_firstname').value,
          "attendee_surname": this.bookingForm.get('attendee_surname').value,
          "mobile_number": this.bookingForm.get('mobile_number').value,
          "booking_trial": this.bookingTrial,
        }
      }

      this.bookingService.createWalkIn(form_data).toPromise().then(
        res => {
          this.bookingTrial = 0;
          this.bookingForm.reset();
          this.common.presentPopupAlertForOK("Walk in entry is confirmed.");
          this.modalCtrl.dismiss(true);
          this.common.dismissLoader();
        },
        error => {
          this.common.dismissLoader();
          if (error.error == "ID verification failed.") {
            this.common.presentPopupAlertForOK("Provided Id does not match. Please try again with correct details.");
          } else {
            this.common.presentToast('Unable to create Walkin entry')
            this.modalCtrl.dismiss(false);
            this.bookingForm.reset();
          }
        }
      )
    }
  }

  dismissModal(data) {
    this.modalCtrl.dismiss(data);
  }

  takePicture() {
    this.cameraHlprSrvc.capturePhotoURI().then(async image => {
      this.imgSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(image && (image.webPath));
      this.image = image
      console.log(this.image)
      this.bookingForm.get("passport_image").setValue('passport_image.jpg')
    }).catch(err => {
      console.log(err)
    })
  }
}