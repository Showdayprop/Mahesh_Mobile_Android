import { NotificationService } from './../../providers/notification.service';
import { ChatService } from './../../providers/chat.service';
import { UserManagementService } from './../../providers/user-management.service';
import { Subscription } from 'rxjs';
import { LoggerService } from './../../core/logger.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PropertiesService } from './../../providers/properties.service';
import { UtilityService } from './../../providers/utilities.service';
import { Common } from './../../shared/common';
import { Router, ActivatedRoute, NavigationExtras, NavigationEnd } from '@angular/router';
import { Component, NgZone, ViewChild, HostListener } from '@angular/core';
import { NavController, ModalController, IonContent, IonSlides, Platform } from '@ionic/angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { Plugins } from '@capacitor/core';
import { AgentContactDetailComponent } from '../../components/agent-contact-detail/agent-contact-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from '../../../environments/environment';
import { ImageGalleryComponent } from '../../components/image-gallery/image-gallery.component';
import { BookingService } from '../../providers/booking.service';
import { CreateBookingComponent } from '../../components/create-booking/create-booking.component';


@Component({
  selector: 'property-map',
  templateUrl: 'property-map.html',
  styleUrls: ['./property-map.scss']
})

export class PropertyMapPage {
  @ViewChild(IonContent, undefined) content: IonContent;
  @ViewChild('slides', { static: true }) slides: IonSlides;
  propertyData: any;
  propertId: any;
  geoResponse: any;
  propertyImages: any = [];
  swiperInit = false;
  imagePath;
  isSlidesReady;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 1,
    centeredSlides: true,
    centeredSlidesBounds: true,
    loop: false,
    spaceBetween: 0,
    autoHeight: true
  };
  threeDurl = "https://my.matterport.com/show/?m=xVpQVvHWSzV&brand=0"
  trustedEmbeddedUrl;
  isPhotosTabActive: boolean = true;
  path = environment.config.storagePath;
  pageSubscriptions = new Subscription();
  purchase_price = 0;
  term = 30;
  interest_rate = 7.00;
  monthly_loan_repayment = 0;
  monthlyLoanObject;
  userData;
  pageType: any;
  imgSrc;
  image;
  bookings = [];
  selectedShowday;
  innerArray = [];
  prevRouteId: any;

  constructor(private geolocation: Geolocation,
    public navCtrl: NavController,
    private launchNavigator: LaunchNavigator,
    public dialog: MatDialog,
    private router: Router,
    private common: Common,
    private utilitySrvc: UtilityService,
    private activatedRoute: ActivatedRoute,
    private propertySrvc: PropertiesService,
    private domSanitizer: DomSanitizer,
    private modalCtrl: ModalController,
    private logger: LoggerService,
    private userMgmtSrvc: UserManagementService,
    private chatSrvc: ChatService,
    private notificationSrvc: NotificationService,
    private bookingService: BookingService,
    private ngZone: NgZone
  ) {
    this.prevRouteId = this.activatedRoute.snapshot.queryParams.id;
    localStorage.setItem("propertyDetails", this.activatedRoute.snapshot.queryParams.id);
    localStorage.setItem("propertyDetailsTemp", this.activatedRoute.snapshot.queryParams.id);
    this.pageType = this.activatedRoute.snapshot.queryParams.type;
    this.userData = this.userMgmtSrvc.user.getValue();
    this.initialize();
  }

  @HostListener('document:ionBackButton', ['$event'])
  overrideHardwareBackAction(event: any) {
    event.detail.register(100, async () => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    });
  }

  // ionViewWillLeave() {
  //   this.subscription.unsubscribe();
  // }

  initialize() {
    this.pageSubscriptions.add(this.propertySrvc.propertyDetail.subscribe((data: any) => {
      this.propertyData = data;
      if (this.propertyData.similar_properties.length > 0) {
        this.common.presentToast("Similar properties are available at the bottom of this page");
      }
      if (this.propertyData.showdays.length > 0) {
        this.selectedShowday = this.propertyData.showdays[0]
      }
      if (data && data.id) {
        this.propertId = data.id;
        this.logger.log("PropertyMapPage : constructor : data received : ", this.propertId);
        this.processPropertyData();
        this.getBookings();
      }
      else {
        this.logger.error("PropertyMapPage : constructor : empty data ");
      }
    }))
  }

  async processPropertyData() {
    if (this.propertyData && this.propertId) {
      if (this.userData && this.userData.login_id && this.userData.login_id == this.propertyData.joint_mandate_user) {
        // this is the seller trying to share the link, add the query param
        this.pageType = 'joint';
      }
      if (this.propertyData.image_path) {
        this.imagePath = this.propertyData.image_path.substring(0, this.propertyData.image_path.indexOf("medium"));
      }
      if (this.propertyData.input3d_tour) {
        this.trustedEmbeddedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.propertyData.input3d_tour);
      }
      if (this.propertyData.property_images && this.propertyData.property_images.length > 0) {
        this.logger.log("PropertyMapPage : processPropertyData : images are already there ");
        this.propertyImages = this.propertyData.property_images;
      }
      else {
        this.common.presentLoader();
        await this.propertySrvc.getPropertyImages({ id: this.propertId }).toPromise().then(res => {
          if (res && res['property_images'] && res['property_images'].length > 0) {
            this.propertyImages = res['property_images']
          }
          else {
            this.propertyImages = []
            this.common.dismissLoader()
          }
        }).catch(err => this.common.dismissLoader()).finally(() => {
          // this.common.dismissLoader()
        })
      }

      if (this.propertyImages.length && this.propertyImages.length == 1) {
        this.slideOpts.loop = false;
      }
      else {
        this.slideOpts['pagination'] = {
          el: '.swiper-pagination',
          clickable: true,
          type: "fraction",
          // dynamicBullets: true,
          // dynamicMainBullets: 7,
          hideOnClick: false,
          // renderBullet: function (index, className) {
          //   return '<span class="' + className + '">' + (index + 1) + '</span>';
          // },
        }
      }

      if (this.propertyData.upper_price_value) {
        this.purchase_price = this.propertyData.upper_price_value;
      } else if (this.propertyData.bottom_price_value) {
        this.purchase_price = this.propertyData.bottom_price_value;
      } else {
        this.purchase_price = this.propertyData.middle_price_value;
      }
      this.purchase_price = Number(this.purchase_price.toString().replace(/,/g, ''));
      console.log(this.purchase_price)
      this.calculate();
    }
    else {
      this.logger.error('Property Detail Screen : Property data is undefined or not valid');
      this.common.presentToast('Unable to load property details. Please try again later.');
      setTimeout(() => {
        this.navCtrl.back();
      }, 3000);
    }
  }
  sliderLoaded() {
    this.common.dismissLoader()
  }
  calculate() {
    let loanval = this.purchase_price;
    let rate = 1;
    rate = this.interest_rate / 1200;
    this.monthly_loan_repayment = (rate + rate / ((Math.pow(1 + rate, this.term * 12)) - 1)) * loanval;
  }

  ngOnInit() {
    // this.pageSubscriptions = this.activatedRoute.params.subscribe(val => {
    //   this.initialize();
    // });

    // this.common.presentLoader()
    this.geolocation.getCurrentPosition().then(result => {
      this.geoResponse = result
      // this.common.dismissAllLoaders();
    }).catch(err => {
      // this.common.dismissAllLoaders()
      let loc = this.utilitySrvc.getLocationData()
      if (loc) {
        this.geoResponse['coords'] = {
          latitude: loc.latitude,
          longitude: loc.longitude
        }
      }
    });
  }

  async loadMap() {
    const isGoogleMapAvailable = await this.launchNavigator.isAppAvailable(this.launchNavigator.APP.GOOGLE_MAPS);

    let mapApp;
    if (isGoogleMapAvailable) {
      mapApp = this.launchNavigator.APP.GOOGLE_MAPS;
    } else {
      mapApp = this.launchNavigator.APP.APPLE_MAPS;
    }

    let options: LaunchNavigatorOptions = {
      start: [this.geoResponse.coords.latitude, this.geoResponse.coords.longitude],
      app: mapApp,
      transportMode: this.launchNavigator.TRANSPORT_MODE.DRIVING
    };

    await this.launchNavigator.navigate([this.propertyData.property_latitude, this.propertyData.property_longitude], options);
  }

  async viewContact() {
    let data = {
      seller_name: this.propertyData.fullname,
      seller_contact_number: parsePhoneNumberFromString(this.propertyData.contact_number, 'ZA').formatInternational()
    }
    if (this.pageType && this.pageType == 'joint' && this.propertyData.joint_fullname && this.propertyData.joint_fullname != "" && this.propertyData.joint_contact_number) {
      data.seller_contact_number = this.propertyData.joint_contact_number
      data.seller_name = this.propertyData.joint_fullname
    }
    const dialogRef = this.dialog.open(AgentContactDetailComponent, {
      width: '225px',
      height: '175px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      // alert('Closed');
    });
  }

  async chatContact() {
    let chatInviteUserId;
    if (this.pageType && this.pageType == 'joint' && this.propertyData.joint_fullname && this.propertyData.joint_fullname != "" && this.propertyData.joint_contact_number) {
      if (this.propertyData.joint_user_id) {
        chatInviteUserId = this.propertyData.joint_user_id;
      }
    }
    else if (this.propertyData.agent_id) {
      chatInviteUserId = this.propertyData.agent_id;
    }
    if (!this.userData.isLoggedIn) {
      // the user is not logged in, so send them to login page
      this.common.presentToast('Please Login to use this feature', 'Login Required', 5000, 'dark', true, 'Login').then(res => {
        if (res && res.role == 'cancel') this.router.navigate(['/login'], { replaceUrl: true })
      })
    }
    else {
      // send an invite to the concerned person
      this.common.presentLoader();
      this.chatSrvc.inviteUser(chatInviteUserId).then((resp: any) => {
        console.log(resp)
        if (resp.status = 'success' && resp.msg) {
          this.common.presentToast(resp.msg)
          if (resp.room) {
            // update the data to behavioursubject
            this.notificationSrvc.notificationData$.next(resp);
            // take the user to the chat room
            this.navCtrl.navigateForward(['/chat'])
          }
        }
        else if (resp.msg) this.common.presentToast(resp.msg)
      }).finally(() => {
        this.common.dismissLoader();
      })
    }
  }
  openURL() {
    this.utilitySrvc.openWithInAppBrowser(this.propertyData.input3d_tour);
    // this.utilitySrvc.openURLCapacitorBrowser(this.propertyData.input3d_tour);
  }

  videoTourClicked() {
    this.isPhotosTabActive = false;
    //3d tour , open the tour on tap
    this.openURL();
  }

  async openImageGallery(index) {
    const modal = await this.modalCtrl.create({
      component: ImageGalleryComponent,
      componentProps: {
        images: this.propertyImages.map(el => this.imagePath + el.gallery_image),
        currentIndex: index
      }
    });
    return await modal.present();
  }

  async share() {
    this.common.presentLoader();
    let isSeller = false;
    if (this.userData && this.userData.login_id && this.userData.login_id == this.propertyData.joint_mandate_user) {
      // this is the seller trying to share the link, add the query param
      isSeller = true;
    }
    let url = await this.utilitySrvc.createDynamicLinkForProperty(this.propertyData.id, isSeller)
    if (url) {
      this.logger.log('PropertyMapPage : share : deeplinked share url', url);
      this.utilitySrvc.storeDynamicLink(url, this.propertyData.id).toPromise().then(d => console.log(d))
      this.common.dismissLoader();


      let shareObj = {
        title: this.propertyData.property_type + ' For ' + this.propertyData.available_for + ' in ' + this.propertyData.area,
        text: this.propertyData.property_name + '. Open in Showday Mobile App:',
        // url: url.toString() + '?id=' + this.propertyData.id,
        url: url.toString(),
        dialogTitle: 'Share With Friends & Family'
      };

      console.log("shareObj=>", shareObj);

      await Plugins.Share.share(shareObj).catch((error) => {
        console.log(error);
      })

    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }

  selectShowday(event) {
    this.selectedShowday = event.detail.value
  }

  bookShowday(id) {
    if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      this.navCtrl.navigateRoot('/login')
    } else {
      let props = {
        id: id,
        type: "Pre-Booking"
      };
      this.common.presentAlertForConfirmation('Do you want to book the showday?', 'Confirm').then(async () => {
        const modal = await this.modalCtrl.create({
          component: CreateBookingComponent,
          componentProps: props
        });
        modal.present();
        modal.onDidDismiss().then((data) => {
          if (data) {
            this.getBookings();
          }
        })
      })
    }
  }

  async propertyVideo(data: any) {
    if (data && data.external_url) {
      this.utilitySrvc.openURLCapacitorBrowser(data.external_url);
      return;
    }
    window.open(this.propertyData.video_link);
  }

  async propertyModel(data: any) {
    if (data && data.external_url) {
      this.utilitySrvc.openURLCapacitorBrowser(data.external_url);
      return;
    }
    let navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: data.id
      },
    };
    this.router.navigate(['../', 'property-tour'], navigationExtras);
  }

  reCalculate() {
    this.monthlyLoanObject = {
      pp: this.purchase_price,
      deposite: 0,
      term: this.term,
      interest_rate: this.interest_rate,
    }
    this.router.navigateByUrl("/calculators/monthly-repayment?data=" + btoa(JSON.stringify(this.monthlyLoanObject)))
  }
  swiperReady() {
    this.isSlidesReady = true;
    console.log(this.isSlidesReady)
  }

  getBookings() {
    this.bookingService.getBookings({ property_id: this.propertId }).toPromise().then((res: any) => {
      console.log(res)
      this.bookings = res;
    })
  }

  cancelBooking(id) {
    this.bookingService.update_booking_status({ action: "Cancelled", booking_id: id, note: "Cancelled by user" }).toPromise().then((res: any) => {
      console.log(res)
      this.ngZone.run(() => {
        this.common.presentToast('Booking cancelled successfully.')
        this.getBookings();
      })
    })
  }

  ngOnDestroy() {
    this.pageSubscriptions.unsubscribe();
  }

  propertyById(id) {
    this.common.presentLoader();
    this.propertySrvc.getPropertyDetailsByID({ id: id }).toPromise().then((res: any) => {
      if (res) {
        this.innerArray.push(this.prevRouteId);
        this.prevRouteId = id;
        this.propertySrvc.propertyDetail.next(res);
        this.propertySrvc.propertyID.next(res.id);
        this.scrollToTop();
        this.slides.slideTo(0);
      }
    }).finally(() => {
      this.common.dismissLoader();
    });
  }

  goBack() {
    this.common.presentLoader();
    this.propertySrvc.getPropertyDetailsByID({ id: this.innerArray[this.innerArray.length - 1] }).toPromise().then((res: any) => {
      if (res) {
        this.prevRouteId = this.innerArray[this.innerArray.length - 1];
        this.innerArray.pop();
        this.propertySrvc.propertyDetail.next(res);
        this.propertySrvc.propertyID.next(res.id);
        this.scrollToTop();
      }
    }).finally(() => {
      this.common.dismissLoader();
    });
  }

  redirectTo(uri: string, id: number) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['../', uri], { queryParams: { id: id } });
    });
  }



  scrollToTop() {
    this.content.scrollToTop(400);
  }
}
