import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateBookingComponent } from '../../../components/create-booking/create-booking.component';
import { ImageGalleryComponent } from '../../../components/image-gallery/image-gallery.component';
import { VerificationStatusPopoverComponent } from '../../../components/verification-status-popover/verification-status-popover.component';
import { LoggerService } from '../../../core/logger.service';
import { BookingService } from '../../../providers/booking.service';
import { PropertiesService } from '../../../providers/properties.service';
import { UserManagementService } from '../../../providers/user-management.service';
import { Common } from '../../../shared/common';
import {CallNumber} from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {

  userData
  propertyData;
  propertId;
  pageSubscriptions = new Subscription();
  bookings = [];
  walkIns = [];
  showday;
  booking;

  constructor(
    private userMgmtSrvc:UserManagementService,
    private propertySrvc: PropertiesService,
    private logger: LoggerService,
    private bookingService: BookingService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private common: Common,
    private modalCtrl: ModalController,
    private call:CallNumber,
  ) { 
    this.userData = this.userMgmtSrvc.user.getValue();
    this.pageSubscriptions.add(this.propertySrvc.propertyDetail.subscribe((data: any) => {
      console.log(data)
      this.propertyData = data;
      if (data && data.id) {
        this.propertId = data.id;
        this.logger.log("PropertyMapPage : constructor : data received : ", this.propertId);
      }
      else {
        this.logger.error("PropertyMapPage : constructor : empty data ");
      }
    }))
  }

  ngOnInit() {
  }

  getBookings(showday_id, ev?){
    this.bookingService.getBookings({property_id:this.propertId, showday_id:showday_id, type:"seller"}).toPromise().then((res:any)=>{
      console.log(res)
      this.bookings = res;
    }).finally(()=>{
        if(ev){
          ev.target.complete();
        }
      }
    )
  }

  selectShowday(event){
    console.log(event)
    this.showday = event.detail.value;
    this.getBookings(event.detail.value.id);
  }

  changeAttendeeVerificationStatus(status, booking_id, type){
    if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    }else{
      this.bookingService.update_verification_status({booking_id:booking_id, status:status, type:type}).toPromise().then((res:any)=>{
        this.getBookings(this.showday.id); 
      })
    }
  }

  updateAttendance(status, booking){
    if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    }else{
      if(booking.type == "Pre-Booking"){
        this.bookingService.update_booking_status({action:status,booking_id:booking.booking_id,note:"User "+ status +" marked by agent."}).toPromise().then((res:any)=>{
          this.getBookings(this.showday.id);   
        })
      }else{
        this.bookingService.update_walkin_status({action:status,walkin_id:booking.booking_id,note:"User "+ status +" marked by agent."}).toPromise().then((res:any)=>{
          this.getBookings(this.showday.id);   
        })
      }
    }
  }

  async openImageGallery(booking) {
    const modal = await this.modalCtrl.create({
      component: ImageGalleryComponent,
      componentProps: {
        images: [environment.config.baseStorageUrl + "\/storage\/passport_images\/"+booking.passport_image_name],
        currentIndex: 0
      }
    });
    return await modal.present();
  }

  bookWalkIn(id) {
    if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    }else{
      let props = {
        id : id,
        type: "Walk-In"
      };
      this.common.presentAlertForConfirmation('Do you want to book the walk-in entry?','Confirm').then(async ()=>{
        //this.navCtrl.navigateForward(['../create-booking'], { queryParams: { showdayId: id } })
        const modal = await this.modalCtrl.create({
          component: CreateBookingComponent,
          componentProps: props
        });
        modal.present();
        modal.onDidDismiss().then((data) => {
          if(data){
            this.getBookings(id);
          }
        })
      })
    }
  }

  async openVerificationPopup(ev, booking){
    const searchPopover = await this.popoverCtrl.create({
      component: VerificationStatusPopoverComponent,
      event: ev,
      translucent: true,
      keyboardClose: false,
      showBackdrop: true,
      backdropDismiss: true,
      componentProps: {
        "status": booking.attendee_verification_status
      },
    })
    await searchPopover.present();
    const { data } = await searchPopover.onDidDismiss()
    console.log(data)
    console.log(booking.booking_id)
    if (data) {
      this.changeAttendeeVerificationStatus(data, booking.booking_id, booking.type)
    }
  }

  dialNumber(contactNumber) {
    this.call.callNumber(contactNumber, true);
  }

  doRefresh(event){
    if(this.showday){
      this.bookings=[];
      this.getBookings(this.showday.id, event); 
    }else{
      if(event){
        event.target.complete();
      }
    }
  }
}
