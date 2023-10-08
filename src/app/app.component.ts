import { TrackerService } from './providers/tracker.service';
import { RouterHelperService } from './providers/router-helper.service';
import { ChatService } from './providers/chat.service';
import { DirectoryService } from './providers/directory.service';
import { Router } from '@angular/router';
import { Market } from '@ionic-native/market/ngx';
import { NotificationService } from './providers/notification.service';
import { LoggerService } from './core/logger.service';
import { SupportService } from './providers/support.service';
import { AuthenticationService } from './providers/authentication.service';
import cloneDeep from 'lodash.clonedeep';
import { Common } from './shared/common';
import { UserManagementService } from './providers/user-management.service';
import { GlobalConfigService } from './providers/global-config.service';
import { StorageService } from './providers/storage.service';
import { Component, NgZone } from '@angular/core';
import { Platform, NavController, MenuController, AlertController, ModalController } from '@ionic/angular';
import { UtilityService } from './providers/utilities.service';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Pages } from './interfaces/pages';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed, Capacitor, PermissionType, StatusBarStyle } from '@capacitor/core';
import { SupportDetailComponent } from './components/support-detail/support-detail.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
// import { Analytics } from 'capacitor-analytics';
import { environment } from "../environments/environment";
import { PropertiesService } from './providers/properties.service';
import { ProviderDetailComponent } from './pages/dashboard/provider-detail/provider-detail.component';
// import { Deploy } from 'cordova-plugin-ionic';
// const analytics = new Analytics();
//import { CapacitorFirebaseDynamicLinksPlugin } from '@turnoutt/capacitor-firebase-dynamic-links'
const { PushNotifications, Share, Permissions, App, CapacitorFirebaseDynamicLinks, StatusBar, SplashScreen } = Plugins;


export interface LocationObject {
  latitude: string;
  longitude: string;
  countryCode: string;
  locality: string;
  subLocality: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  public appPages: Array<Pages>;
  public currentUserLocation: any;
  public userData: any = {};
  pageSubscriptions = new Subscription()
  functionalTypes: any;
  firebasePluginCaptureUrl = false;
  logString = '';
  version;
  appUpdatePending = false;
  isSeller = false;
  isUpdateAvailable: boolean = false;
  updateProgress;
  info: any;

  constructor(
    private platform: Platform,
    public dialog: MatDialog,
    public navCtrl: NavController,
    private nativeGeocoder: NativeGeocoder,
    public utilityService: UtilityService,
    private geolocation: Geolocation,
    private storageSrvc: StorageService,
    public globalConfigSrvc: GlobalConfigService,
    private userMgmtSrvc: UserManagementService,
    private menuCtrl: MenuController,
    private common: Common,
    private authSrvc: AuthenticationService,
    private alertCtrl: AlertController,
    private supportSrvc: SupportService,
    private logger: LoggerService,
    private zone: NgZone,
    private firebaseDynamicLinks: FirebaseDynamicLinks,
    public notificationSrvc: NotificationService,
    private propertiesSrvc: PropertiesService,
    private market: Market,
    private router: Router,
    private directorySrvc: DirectoryService,
    private modalCtrl: ModalController,
    private chatSrvc: ChatService,
    private routerHlprSrvc: RouterHelperService,
    private ngZone: NgZone,
    private trackerSrvc: TrackerService
  ) {

    this.appPages = [
      // {
      //   title: 'Home',
      //   icon: 'apps',
      //   url: '/dashboard/categories',
      //   disabled: false
      // },
      // {
      //   title: 'My Showday Log',
      //   icon: 'browsers',
      //   url: '/home',
      //   disabled: true
      // },
      // {
      //   title: 'Suburb Stats',
      //   icon: 'calculator',
      //   url: '/home',
      //   disabled: true
      // },
      // {
      //   title: 'For Sale/Rent',
      //   icon: 'list-box',
      //   url: '/seller',
      // },
      {
        title: 'Settings',
        icon: 'settings',
        url: '/settings'
      },
      {
        title: 'Notifications',
        icon: 'list',
        url: '/notifications'
      },
      {
        title: 'Manage Notifications',
        icon: 'notifications',
        url: '/alerts-filters',
        queryParams: { page: 'alerts' }
      },
      {
        title: 'Favourites',
        icon: 'heart',
        url: '/favourites'
      },
      {
        title: 'Calculators',
        icon: 'calculator',
        url: '/calculators'
      },
      // {
      //   title: 'Post your Service',
      //   icon: 'cart',
      //   url: '/affiliate-provider',
      //   queryParams: { page: 'service-provider' }
      // },
      // {
      //   title: 'Showday Bookings',
      //   icon: 'calendar',
      //   url: '/booking/booking-list'
      // }
    ];
  }

  ngOnInit() {
    this.pageSubscriptions.add(this.userMgmtSrvc.user.subscribe(data => {
      this.userData = data;
      // check for user logged in
      if (this.userData.isLoggedIn) {
        this.chatSrvc.startSocketConnection();
      }
      if (this.userData.id) {
        if (this.userData.account_type == "employee" || this.userData.myRoles.includes('2') || this.userData.myRoles.includes('4')) {
          this.ngZone.run(
            () => {
              this.isSeller = true;
            }
          )
        } else {
          this.ngZone.run(
            () => {
              this.isSeller = false;
            }
          )
        }
      }
    }))
    this.platform.ready().then(async () => {
      this.logger.log(this.constructor.name, ": Device has initialized")
      // this.checkForUpdates()
      console.log("Capacitor.isPluginAvailable('CapacitorFirebaseDynamicLinks')=>", Capacitor.isPluginAvailable('CapacitorFirebaseDynamicLinks'));

      this.initializeAppLinks();
      // if (Capacitor.isPluginAvailable('CapacitorFirebaseDynamicLinks')) {
      // }



      this.globalConfigSrvc.getDeviceInfo().then(() => {
        // checkForAppUpdate
        let type = this.globalConfigSrvc.deviceInfo.operatingSystem;
        this.version = 'v ' + this.globalConfigSrvc.deviceInfo.appVersion;
        console.log("version=>", this.version);
        console.log("globalConfigSrvc=>", this.globalConfigSrvc);
        let ver = this.globalConfigSrvc.deviceInfo.appVersion.replace(/\./g, '0');
        if (this.globalConfigSrvc.deviceInfo.appVersion && this.globalConfigSrvc.deviceInfo.appVersion != "") {
          this.utilityService.checkForUpdate({ type: type, version: ver }).toPromise().then(res => {
            this.logger.log('checkForUpdate: ', res)
            this.appUpdatePending = (res == "update")
            if (this.appUpdatePending) {
              this.common.presentAlertForConfirmation('A new update is available for Showday.', 'Update Available').then(res => {
                this.promptForUpdate();
              })
            }
          }).catch(err => {
            this.logger.error(err)
          })
        }
        else {
          this.logger.log('No Version Present : No check triggered', this.version, ':', ver)
        }
      });
      //first fetch the current geo location
      this.geolocation.getCurrentPosition().then(geoResponse => {
        this.currentUserLocation = geoResponse.coords;
        this.currentUserLocation['countryCode'] = 'za'
        this.utilityService.setLocationData(this.currentUserLocation);
        this.nativeGeocoder.reverseGeocode(geoResponse.coords.latitude, geoResponse.coords.longitude, {
          useLocale: true,
          maxResults: 5
        }).then((result: NativeGeocoderResult[]) => {
          this.currentUserLocation = result[0];
          this.utilityService.setLocationData(this.currentUserLocation);
        })
          .catch((error: any) => console.log(error));
      });
      this.fetchDataFromServer();
      if (Capacitor.isPluginAvailable('PushNotifications')) {
        this.initPushNotifications();
      }
      if (Capacitor.isPluginAvailable('StatusBar')) {
        StatusBar.setStyle({
          style: StatusBarStyle.Dark
        });
      }
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        SplashScreen.hide();
      }
    }).catch((err) => {
      console.log(err)
    });
  }
  fetchDataFromServer() {
    this.directorySrvc.getCategories().then(res => {
      this.directorySrvc.directoryCategories.next(res)
    }).catch(err => {
      this.storageSrvc.getObject('categories').then(data => {
        if (data) {
          this.directorySrvc.directoryCategories.next(data)
        }
        else {
          this.logger.log('fetchDataFromServer : getCategories : error block : getStorage is also error')
        }
      })
    })
    this.utilityService.getHouseTypes();
    this.utilityService.getRequirements();
    this.notificationSrvc.refreshNotificationsCount();
    // setTimeout(() => {
    //   this.utilityService.performAutomaticUpdate().then(res=>{console.log('Update done')})
    // }, 1000);
  }
  viewSupport() {
    const dialogRef = this.dialog.open(SupportDetailComponent, {
      width: '225px',
      height: '175px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // alert('Closed');
    });
  }

  goToEditProgile() {
    this.navCtrl.navigateForward('edit-profile');
  }

  sell() {
    this.navCtrl.navigateForward('/seller');
  }

  logout() {
    // this.userMgmtSrvc.removeUserDataOnLogout();
    this.authSrvc.logout().toPromise().then(res => {
      this.globalConfigSrvc.authToken = undefined;
      this.logger.removeDeviceKey();
    }).catch(err => {
      console.error("Server unable to kill the auth token. Check")
    })
    let storeForFutureLogin = {
      myRoles: cloneDeep(this.userData.myRoles),
      id: cloneDeep(this.userData.id),
      email_address: cloneDeep(this.userData.email_address)
    }
    this.storageSrvc.setObject('userInfo_' + this.userData.id, storeForFutureLogin)
    let loggedOutUserInfo = {
      myRoles: this.userData.myRoles.filter(el => el != "2" && el != "3" && el != "5"),
      isLoggedIn: false,
      device_id: this.globalConfigSrvc.deviceInfo.uuid
    }
    this.storageSrvc.setObject('userFav', [])
    this.propertiesSrvc.userFavsIds = [];
    this.userMgmtSrvc.updateUser(loggedOutUserInfo)
    this.isSeller = false;
    // this.navCtrl.navigateRoot('/')
    this.menuCtrl.toggle()
    this.chatSrvc.disconnectSocket()
    this.common.presentToast('You have been Logged out.!')
    // this.navCtrl.navigateRoot('/home')
    this.navCtrl.navigateRoot('/dashboard/categories')
  }
  async goToListings() {
    if (this.userData && this.userData.is_active && this.userData.is_active == "1") {
      //user is activated, navigate forward
      console.log('activated')
      this.navCtrl.navigateRoot('/seller')
    }
    else if (!this.userData.isLoggedIn) {
      this.common.presentPopupAlertForOK('Please login to use this feature.!')
      // this.navCtrl.navigateRoot('/seller')
    }
    else {
      //user is deactivated, prompt for admin request
      const alert = await this.alertCtrl.create({
        header: 'Contact Admin!',
        message: 'Your profile is <strong>pending activation</strong>. Do you want to contact admin?',
        inputs: [{
          name: 'message',
          id: 'message',
          type: 'text',
          placeholder: 'Message (Optional)'
        },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Send Request',
            handler: (data) => {
              console.log(data.message);
              this.sendEmailToAdmin(data.message)
            }
          }
        ]
      });

      await alert.present();
    }
  }
  async sendEmailToAdmin(msg) {
    if (!this.utilityService.functionalTypes) {
      await this.utilityService.getFunctionalTypes().toPromise().then(res => {
        this.functionalTypes = res
        this.utilityService.functionalTypes = res;
      })
    }
    else {
      this.functionalTypes = this.utilityService.functionalTypes
    }
    let roleNames = this.functionalTypes.filter(el => {
      return this.userData.myRoles.includes(el.f_id)
    }).map(ele => ele.f_name).join(', ')
    let dataObj = {
      "first_name": this.userData.first_name,
      "surname": this.userData.surname ? this.userData.surname : '',
      "email_address": this.userData.email_address,
      "mobile_number": this.userData.contact_number ? this.userData.contact_number : '',
      "message": msg,
      "roles": roleNames,
    }
    console.log(dataObj)
    this.supportSrvc.requestAdminForAccess(dataObj).toPromise().then((res: any) => {
      console.log(res)
      this.common.presentToast('Your request has been sent to the Admin. You will be contacted shortly.!')
    }).catch(err => {
      console.log(err)
      this.common.presentToast('Unable to send request. Please contact App support.!')
    })
  }

  login() {
    this.navCtrl.navigateForward('/login')
  }

  async initPushNotifications() {
    const hasPermission = await Permissions.query({ name: PermissionType.Notifications });
    console.log(hasPermission)
    if (hasPermission.state == 'prompt') {
      this.logger.log("appComponent : hasPermission :", hasPermission.state)
      this.common.presentAlertForConfirmation("When asked, tap 'Allow' to receive push notifications for new listings", 'To enable push notifications', 'Got it', 'Later').then(() => {
        PushNotifications.requestPermission().then(result => {
          if (result.granted) {
            // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register();
            this.logger.log("appComponent : hasPermission : permission granted")
          } else {
            this.logger.log("appComponent : hasPermission : permission denied by user")
          }
        });
      })
    }
    else {
      let exisitngToken = await this.storageSrvc.getItem('push_token');
      this.logger.log("appComponent : exisitngToken :", exisitngToken)
      if (!exisitngToken) {
        this.logger.log("appComponent : exisitngToken : requesting permission")
        PushNotifications.requestPermission().then(result => {
          if (result.granted) {
            // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register();
            this.logger.log("appComponent : exisitngToken : permission granted")
          } else {
            this.logger.log("appComponent : exisitngToken : permission denied by user")
          }
        });
      }
      else {
        this.globalConfigSrvc.pushToken = exisitngToken;
        // this.chatSrvc.updatePushToken(exisitngToken);
      }
    }
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        console.log(token.value)
        this.globalConfigSrvc.checkAndSetPushToken(token.value);
        this.logger.log("appComponent : pushRegistration :", token.value)
      }
    );
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error));
      }
    );
    // event when notification arrive
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        this.zone.run(() => {
          console.log(notification);
          this.logger.log("appComponent : pushNotificationReceived :", notification)
          if (notification.data && notification.data.type == 'chat') {
            if (this.routerHlprSrvc.currentUrl.indexOf('chat') > -1 && notification.data.room) {
              // the user is already on the chat page, so socket listener would have handled it
              return;
            }
            else {
              // user is on some other view, show a toast
              this.common.presentToast(notification.body, notification.title, 5000, 'primary')
              // also, show the unread marker on the tab
              let count = Number(this.chatSrvc.unreadCount$.getValue());
              this.chatSrvc.unreadCount$.next(count + 1);
            }
            return;
          }
          this.notificationSrvc.refreshNotificationsCount();
          this.common.presentAlertForConfirmation(notification.body, notification.title, 'Open', 'See Later').then(() => {
            if (notification.data && notification.data.value) {
              if (notification.data.noti_id) {
                this.notificationSrvc.markAsRead({ id: notification.data.noti_id }).toPromise().then(res => {
                })
              }
              if ((notification.data.type == "new_showday_walkin" || notification.data.type == "new_showday_booking") && this.userData.isLoggedIn) {
                this.navigateToProperty(notification.data.value, 'attendance');
              }
              else {
                this.navigateToProperty(notification.data.value);
              }
            }
            else if (notification.data && notification.data.type == "app_update") {
              //push notification ot update the app
              this.promptForUpdate();
            }
          })
        })
      }
    );
    // event when user tap to the notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (res: PushNotificationActionPerformed) => {
        this.zone.run(() => {
          console.log(res);
          this.logger.log("appComponent : pushNotificationActionPerformed : ", res)

          if (res.notification && res.notification.data && res.notification.data.type == 'chat') {
            // if (this.userData && this.userData.id == res.notification.data.userID) {
            // update the data to behavioursubject
            this.notificationSrvc.notificationData$.next(res.notification.data);
            // take the user to the chat room
            this.navCtrl.navigateForward(['/chat'])
            // }
            // else {
            //   // user id mismatch, do nothing
            //   this.common.presentToast('Your account is not authorized to enter the chat room.')
            // }
            return;
          }
          this.notificationSrvc.refreshNotificationsCount();
          if (res.notification.data && res.notification.data.value) {
            if (res.notification.data.noti_id) {
              this.notificationSrvc.markAsRead({ id: res.notification.data.noti_id }).toPromise().then(res => {
              })
            }
            if ((res.notification.data.type == "new_showday_walkin" || res.notification.data.type == "new_showday_booking") && this.userData.isLoggedIn) {
              this.navigateToProperty(res.notification.data.value, 'attendance');
            }
            else {
              this.navigateToProperty(res.notification.data.value);
            }
          }
          else if (res.notification.data && res.notification.data.type == "app_update") {
            //push notification ot update the app
            this.promptForUpdate();
          }
        })
      }
    );
  }
  navigateToProperty(propertyID, pageType?) {
    this.common.presentLoader();
    this.propertiesSrvc.getPropertyDetailsByID({ id: propertyID }).toPromise().then((res: any) => {
      this.firebasePluginCaptureUrl = false;
      this.logger.log("appComponent : navigateToProperty : finally dismiss loader")
      this.common.dismissLoader();
      if (res) {
        if (res.external_url) {
          this.utilityService.openURLCapacitorBrowser(res.external_url);
          return;
        }
        this.zone.run(() => {
          this.propertiesSrvc.propertyDetail.next(res);
          this.propertiesSrvc.propertyID.next(res.id);
          if (pageType) {
            if (pageType == "video") {
              this.logger.log("appComponent : navigateToProperty : navigating", this.router.url);
              if (this.router.url.indexOf('property-video') == -1) {
                this.navCtrl.navigateForward('property-video', {
                  queryParams: {
                    id: res.id
                  }
                })
              }
            }
            if (pageType == "model") {
              this.logger.log("appComponent : navigateToProperty : navigating", this.router.url);
              if (this.router.url.indexOf('property-tour') == -1) {
                this.navCtrl.navigateForward('property-tour', {
                  queryParams: {
                    id: res.id
                  }
                })
              }
            }
            if (pageType == 'joint' && this.router.url.indexOf('property-detail') == -1) {
              this.navCtrl.navigateForward('property-detail', {
                queryParams: {
                  id: res.id,
                  type: 'joint'
                }
              })
            }
            if (pageType == 'attendance') {
              this.navCtrl.navigateForward('seller/attendance');
            }
          } else {
            this.logger.log("appComponent : navigateToProperty : navigating", this.router.url);
            if (this.router.url.indexOf('property-detail') == -1) {
              this.navCtrl.navigateForward('property-detail', {
                queryParams: {
                  id: res.id
                }
              })
            }
          }
        });
      }
      else {
        this.common.presentToast('Unable to retrieve the property details.')
        this.logger.log("appComponent : navigateToProperty : getPropertyDetailsByID : no property found in db")
      }
    }).catch(err => {
      this.logger.log("appComponent : navigateToProperty : getPropertyDetailsByID : error : ", err)
      this.firebasePluginCaptureUrl = false;
      this.common.dismissLoader();
    })
  }

  navigateToCalculator(url) {
    let data = url.substring(url.lastIndexOf('/') + 1);
    let sub1 = "/calculator/";
    let sub2 = "/data/";
    let SP = url.indexOf(sub1) + sub1.length;
    let string1 = url.substr(0, SP);
    let string2 = url.substr(SP);
    let TP = string1.length + string2.indexOf(sub2);
    let name = url.substring(SP, TP);

    console.log("Name : " + name);
    this.zone.run(() => {
      this.navCtrl.navigateForward("/calculators/" + name, {
        queryParams: {
          data: data
        }
      })
    });
  }

  async initializeAppLinks() {
    /* this.firebaseDynamicLinks.onDynamicLink().subscribe((res: any) => {
      this.zone.run(() => {
        this.firebasePluginCaptureUrl = true;
        console.log(res)
        this.logger.log("appComponent : firebaseDynamicLinks : Dynamic Link Capture : Success : URL :", res)
        if (res.deepLink) {
          let property_id = res.deepLink.substr(res.deepLink.length - 4);
          if (!isNaN(property_id)) {
            //got the proeprty id
            this.navigateToProperty(property_id);
          }
          else {
            this.common.presentToast('Unable to fetch property details. Contact support.')
          }
        }
      })
    }, (error: any) => {
      this.zone.run(() => {
        console.log(error)
        this.logger.log("appComponent : firebaseDynamicLinks : Dynamic Link Capture : Error : ", error)
      })
    }); */
    this.firebasePluginCaptureUrl = false;
    let ret = await App.getLaunchUrl();
    this.logger.log('initializeAppLinks : App.getLaunchUrl: ', ret);
    console.log('initializeAppLinks : App.getLaunchUrl: ', ret);

    this.firebaseDynamicLinks.onDynamicLink().subscribe((data: any) => {
      console.log('app was opened with dynamic link');
      console.log(data);

      //CapacitorFirebaseDynamicLinks.addListener('deepLinkOpen', (data: { url: any }) => {
      this.logger.log('IOS : new Plugin:data : ', data);
      // this.logger.updateInDeviceLogs(new Date().toLocaleString() + ' :: NEW FIREBASE PLUGIN ' + JSON.stringify(data) + '<br>')
      // if (this.platform.is('ios')) {

      data["url"] = data.deepLink;
      
      let pageType;
      if (data.url.indexOf('#') != -1) {
        pageType = data.url.substr(data.url.indexOf('#') + 1);
        data.url = data.url.substr(0, data.url.indexOf('#'));
      }
      else if (data.url.indexOf('?type=joint') != -1) {
        // joint mandate property
        pageType = 'joint';
        data.url = data.url.substr(0, data.url.indexOf('?type'));
      }

      let property_id = data.url.substr(data.url.length - 4);
      this.logger.log('IOS : NEW plugin dynamic links: property id: ', property_id);
      if (!isNaN(property_id)) {
        //got the proeprty id
        this.firebasePluginCaptureUrl = true;
        this.logger.log('IOS : NEW plugin dynamic links: navigating to property');
        this.navigateToProperty(property_id, pageType);
      } else if (data.url.indexOf('/calculator/') !== -1) {
        this.firebasePluginCaptureUrl = true;
        this.logger.log('IOS : NEW plugin dynamic links: navigating to calculator');
        this.navigateToCalculator(data.url);
      }
      else if (data.url.indexOf('/provider/') !== -1) {
        //service provider dynamic link
        this.firebasePluginCaptureUrl = true;
        this.logger.log('IOS : NEW plugin dynamic links: navigating to Service Provider');
        let id = data.url.substring(data.url.lastIndexOf('/') + 1);
        this.navigateToSerivceProvider(id)
      }
      else if (data.url.indexOf('/tracker/') !== -1) {
        // this is a tracker url, get id, get data, navigate
        let trackerSetId = data.url.substr(data.url.lastIndexOf('/') + 1)
        if (!isNaN(trackerSetId)) {
          this.trackerSrvc.getSet({ id: trackerSetId }).toPromise().then(res => {
            if (res) {
              this.zone.run(() => {
                this.trackerSrvc.detailObj$.next(res);
                this.navCtrl.navigateForward('/tracker/detail', {
                  queryParams: { type: 'dynamic' }
                })
              })
            }
            else {
              this.common.presentToast('Cannot fetch details from server. Contact support team.')
            }
          }).catch(err => console.log(err)).finally(() => this.common.dismissAllLoaders())
        }
        else this.logger.error('Tracker Dynamic Link : cannot extract tracker set id:', data.url);
      }
      else {
        this.logger.error('IOS : cap plugin dynamic links: error:', property_id);
      }
      // }
      //  })

    }, (error: any) => {
      console.log(error)
    });


    /* App.addListener('appUrlOpen', (data: any) => {
      this.zone.run(() => {
        this.logger.updateInDeviceLogs(new Date().toLocaleString() + ' :: EXISTING FIREBASE PLUGIN' + JSON.stringify(data) + '<br>')
        this.logger.log('initializeAppLinks : cap plugin dynamic links:firebasePluginCaptureUrl : ', this.firebasePluginCaptureUrl);
        this.logger.log('initializeAppLinks : cap plugin dynamic links:platform : ', this.platform.is('ios'));
        this.logger.log('initializeAppLinks : cap plugin dynamic links:isIOS : ', this.isIOS);
        this.logger.log('initializeAppLinks : cap plugin dynamic links:data : ', data);
        if ((this.platform.is('ios') || this.isIOS) && data.url.indexOf('dismiss') == -1 && !this.firebasePluginCaptureUrl) {
          this.logger.log('IOS : cap plugin dynamic links: ', data.url);
          let property_id = data.url.substr(data.url.length - 4);
          if (data.url.indexOf('&match_type') > -1 && data.url.indexOf('deep_link_id') > -1) {
            property_id = data.url.slice(data.url.indexOf('&match_type') - 4, data.url.indexOf('&match_type'));
          }
          else if (data.url.indexOf('&apn') > -1) {
            property_id = data.url.slice(data.url.indexOf('&apn') - 4, data.url.indexOf('&apn'));
          }
          this.logger.log('IOS : cap plugin dynamic links : property id: ', property_id);
          if (!isNaN(property_id)) {
            //got the proeprty id
            this.firebasePluginCaptureUrl = true;
            this.navigateToProperty(property_id);
          }
          else {
            this.logger.error('IOS : cap plugin dynamic links : error:', property_id);
          }
        }
        else {
          this.logger.log('initializeAppLinks : cap plugin dynamic links : appUrlOpen : first condition failed:');
        }
      })
    }); */
  }

  async navigateToSerivceProvider(id) {
    const modal = await this.modalCtrl.create({
      component: ProviderDetailComponent,
      componentProps: {
        id: id
      }
    });
    return await modal.present();
  }

  async share() {
    let shareRet = await Share.share({
      title: 'Checkout this amazing App',
      text: 'Totally amazing app to receive Showday updates and new listing notifications',
      url: 'https://showday.page.link/6SuK',
      dialogTitle: 'Share With Friends & Family'
    });
  }
  async searchByRef() {
    const alert = await this.alertCtrl.create({
      header: 'Search Property by Ref #',
      message: 'Enter the Ref #',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary'
      }, {
        text: 'Okay',
        handler: (data) => {
          console.log(data.reference);
          this.navigateToProperty(data.reference);
        }
      }],
      inputs: [
        {
          name: 'reference',
          type: 'number',
          placeholder: 'Ref #'
        }
      ]
    });

    await alert.present();
  }
  async promptForUpdate() {
    let appId;
    if (this.globalConfigSrvc.deviceInfo.operatingSystem == "android") {
      appId = "com.properties.showday"
    } else {
      appId = "id1508554476"
    }
    // const alert = await this.alertCtrl.create({
    //   header: 'Update Available',
    //   message: 'A new update is available for Showday.',
    //   backdropDismiss: false,
    //   buttons: [
    //     {
    //       text: 'OK',
    //       handler: () => {
    this.market.open(appId).then(response => {
      this.logger.log('Market Open : success', response);
    }).catch(error => {
      this.logger.error('Market Open : error', error);
    });
    //       }
    //     }
    //   ]
    // })
    // await alert.present();
  }
  deviceLogs() {
    this.navCtrl.navigateForward('device-logs')
  }

  postService() {
    if (this.userData && this.userData.isLoggedIn) {
      // if (this.userData.myRoles.includes('6') && this.userData.account_type == "affiliate") {
      // user is logged in take them to service provider page
      this.navCtrl.navigateRoot('/affiliate-provider')
      // }
      // else {
      //   // add role to their profile and then navigate
      //   this.navCtrl.navigateForward(['/edit-profile'], { queryParams: { page: 'signup' } })
      // }
    }
    else {
      // this.navCtrl.navigateForward(['/login'], { queryParams: { page: 'service-provider' } })
      this.navCtrl.navigateForward(['/login'])
    }
  }

  // async checkForUpdates() {
  //   this.info = await Deploy.getCurrentVersion()
  //   const update = await Deploy.checkForUpdate();
  //   this.isUpdateAvailable = update.available;
  //   if (update.available) {
  //     await Deploy.downloadUpdate((progress) => {
  //       this.updateProgress = progress;
  //     })
  //   }
  // }

  ngOnDestroy() {
    this.chatSrvc.disconnectSocket()
    this.pageSubscriptions.unsubscribe();
  }
}
