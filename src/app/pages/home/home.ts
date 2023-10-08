import { RouterHelperService } from './../../providers/router-helper.service';
import { NotificationService } from './../../providers/notification.service';
import { UtilityService } from './../../providers/utilities.service';
import { Common } from './../../shared/common';
import { UserManagementService } from './../../providers/user-management.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, MenuController, LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { PropertiesService } from '../../providers/properties.service';
import { AuthenticationService } from '../../providers/authentication.service';
import cloneDeep from 'lodash.clonedeep';
import { NavigationExtras, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

const timeoutDelay = 120000;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['./home.scss']
})

export class HomePage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  properties: any = [];
  isLoaded: boolean;
  userData: any;
  hasFilterSet: boolean;
  isRefreshing = false;
  enabledLoader: boolean;
  interval: any;
  userSettings: any;
  userFilters: any;
  nearMeToggle: boolean;
  feturedProperties: any = [];
  feturedPropertiesOffset: number = 0;
  nearMeRadius;
  nearMeProperties: any = [];
  nearMePropertiesOffset: number = 0;
  filteredPropertiesOffset: number = 0;
  locationData: any;
  pageSubscriptions = new Subscription();
  intervalActive: boolean = false;
  isAgent = false;
  previousUrl;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private propertyDataService: PropertiesService,
    private authService: AuthenticationService,
    private utilityService: UtilityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public userMgmtSrvc: UserManagementService,
    private common: Common,
    private notificationSrvc: NotificationService,
    private routerHlprSrvc: RouterHelperService
  ) {
    this.pageSubscriptions.add(this.routerHlprSrvc.previousUrlSub.subscribe(url => {
      this.previousUrl = url;
      console.log(this.previousUrl)
    }))
  }

  ngOnInit() {
    this.locationData = this.utilityService.getLocationData();
    this.pageSubscriptions.add(this.userMgmtSrvc.userSettings.subscribe(data => {
      if (data) {
        this.userSettings = data
        if (this.userMgmtSrvc.nearMeRadiusUpdated) {
          this.infiniteScroll.disabled = true;
          this.nearMePropertiesOffset = 0;
          this.fetchNearMeProperties()
        }
      }
    }))
    this.pageSubscriptions.add(this.userMgmtSrvc.isOnlyRentProperties.subscribe(data => {
      delete this.nearMeProperties;
      delete this.feturedProperties;
    }))

    this.utilityService.getFunctionalTypes().toPromise().then(res => {
      this.utilityService.functionalTypes = res;
    })
  }

  ionViewWillEnter() {
    this.utilityService.refreshLocationData()
    this.menuCtrl.enable(true);
    if (this.previousUrl && this.previousUrl.indexOf('property-detail') > -1 && this.properties && this.properties.length > 0) {
      //view has returned from detailed screen, no need to refresh so return
      return;
    }
    this.notificationSrvc.refreshNotificationsCount();
    this.userData = this.userMgmtSrvc.user.getValue()
    if ((this.userData.myRoles.indexOf("2") > -1 || this.userData.myRoles.indexOf("3") > -1) && this.userData.is_active == 0 && this.userData.isLoggedIn && !this.intervalActive) {
      //start the interval if the user is selller or landlord and it is inactive
      this.intervalActive = true;
      this.setIntervalForUserActiveCheck();
    }
    this.nearMeToggle = this.userSettings && this.userSettings.nearMeToggle != undefined ? this.userSettings.nearMeToggle : true;
    if (this.userSettings.filtersActive) {
      this.enabledLoader = false;
      this.filteredPropertiesOffset = 0;
      this.init(false);
    }
    else if (!this.nearMeToggle) {
      this.nearMeToggled()
    }

    //TODO - the interval logic needs to be reworked
    // this.interval = setInterval(() => {
    //   if (this.hasFilterSet) {
    //     this.enabledLoader = true;
    //     this.init(false);
    //   }
    // }, timeoutDelay);

    // this.events.subscribe('property_filter_change', () => {
    //   this.enabledLoader = false;

    //   if (this.interval) {
    //     clearInterval(this.interval);
    //   }

    //   this.events.unsubscribe('property_filter_change');
    //   this.init(false);
    // });
  }

  init(enableSpinner: boolean, loadingEvent?, loadMore?) {
    this.infiniteScroll.disabled = true;
    this.userFilters = this.userMgmtSrvc.userFilters.getValue()

    if (!this.userFilters || this.userFilters.length == 0 || (Object.keys(this.userFilters).length === 0 && this.userFilters.constructor === Object)) {
      this.hasFilterSet = false;
      return;
    }

    this.hasFilterSet = true;

    if (this.enabledLoader) {
      this.common.presentLoader();
    }

    this.isLoaded = false;
    // this.properties = [];
    this.propertyDataService.showday(
      this.userFilters.areas,
      this.userFilters.requirement,
      this.userFilters.minimum_price,
      this.userFilters.maximum_price,
      this.userFilters.type_of_property,
      this.userFilters.no_bedrooms,
      this.userFilters.no_bathrooms,
      10,
      this.filteredPropertiesOffset
    )
      .toPromise().then(response => {
        this.isLoaded = true;
        if (loadMore) {
          this.properties = [...this.properties, ...response['results']]
        }
        else {
          this.properties = response['results'];
        }
        this._renderDataFromServer(this.properties);

        if (enableSpinner) {
          this.isRefreshing = false;
        }

        if (this.enabledLoader) {
          this.common.dismissLoader();
        }
        if (loadingEvent) {
          loadingEvent.target.complete()
        }
        if (response['results'] && response['results'].length < 10 || (response['results'].length == response['total'])) {
          //no more properties are present in server
          this.infiniteScroll.disabled = true;
        }
        else {
          this.infiniteScroll.disabled = false;
        }
      });
  }

  private _renderDataFromServer(response) {
    if (response.length > 0) {
      this.properties = response.map(o => {
        o.image_full_path = o.image_path + o.default_pic;
        return o;
      });
    } else {
      this.properties = [];
    }
  }

  async propertyDetail(data: any) {
    clearInterval(this.interval);

    // await Storage.remove({
    //   key: 'sd_property_selected'
    // });

    // await Storage.set({
    //   key: 'sd_property_selected',
    //   value: JSON.stringify(data)
    // });
    if (data && data.external_url) {
      this.utilityService.openURLCapacitorBrowser(data.external_url);
      return;
    }
    this.propertyDataService.propertyDetail.next(data);
    this.propertyDataService.propertyID.next(data.id);
    let navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: data.id
      },
      // state: {
      //   key: 'sd_property_selected',
      //   value: data,
      // }
    };
    this.router.navigate(['../', 'property-detail'], navigationExtras);
    // this.navCtrl.navigateForward('property-detail');
  }

  refreshShowdays() {
    if (this.isRefreshing) {
      return;
    }

    this.enabledLoader = true;
    this.isRefreshing = true;
    this.filteredPropertiesOffset = 0;
    this.init(true);
  }

  openFilters() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.navCtrl.navigateForward('property-filters');
  }

  nearMeToggled() {
    this.userSettings['nearMeToggle'] = this.nearMeToggle
    this.userFilters = this.userMgmtSrvc.userFilters.getValue();
    // this.userMgmtSrvc.isOnlyRentProperties.next((this.userData.myRoles.length==1 && this.userData.myRoles[0] =='4'))
    if (this.nearMeToggle) {
      if (this.userSettings.filtersActive) {
        this.userSettings.filtersActive = false;
        // this.userFilters = null;
        this.userMgmtSrvc.updateUserSettings(this.userSettings)
      }
      if (this.nearMeProperties && this.nearMeProperties.length > 0) {
        this.properties = cloneDeep(this.nearMeProperties)
        this._renderDataFromServer(this.properties)
        this.isLoaded = true;
      }
      else {
        this.nearMePropertiesOffset = 0;
        this.infiniteScroll.disabled = true;
        this.fetchNearMeProperties()
      }
    }
    else if (this.userFilters && this.userFilters.length != 0 && Object.keys(this.userFilters).length !== 0) {
      this.userSettings.filtersActive = true;
      this.userMgmtSrvc.userSettings.next(this.userSettings)
      this.init(false);
    }
    // else if(!this.userSettings.filtersActive){
    else {
      if (this.feturedProperties && this.feturedProperties.length > 0) {
        this.properties = cloneDeep(this.feturedProperties)
        this._renderDataFromServer(this.properties)
        this.isLoaded = true;
      }
      else {
        this.feturedPropertiesOffset = 0;
        this.infiniteScroll.disabled = true;
        this.fetchFeaturedProperties()
      }
    }
    this.userMgmtSrvc.updateUserSettings(this.userSettings)
  }

  fetchFeaturedProperties(loadMore?: boolean, loadingEvent?) {
    //?country=za&find=featured&offset=0&limit=10
    //TODO Critical - country has been defaulted to ZA here, change it in case app is deployed to other countries
    this.isLoaded = false;
    let params = {
      country: 'za',
      find: 'featured',
      offset: this.feturedPropertiesOffset,
      limit: 10
    }
    if (this.userData.myRoles.length == 1 && this.userData.myRoles[0] == '4') {
      params['role'] = '4'
    }
    this.isLoaded = false;
    this.common.presentLoader()
    this.propertyDataService.getFeaturedOrNearMeProperties(params).toPromise().then(res => {
      this.isLoaded = true;
      if (res && res['results']) {
        if (loadMore) {
          this.feturedProperties = [...this.feturedProperties, ...res['results']]
        }
        else {
          this.feturedProperties = res['results']
        }
        this.properties = cloneDeep(this.feturedProperties)
        this._renderDataFromServer(this.properties)
        if (res['results'].length < 10 || (res['results'].length == res['total'])) {
          //no more properties are present in server
          this.infiniteScroll.disabled = true;
        }
        else {
          this.infiniteScroll.disabled = false;
        }
      }
      if (loadingEvent) {
        loadingEvent.target.complete();
      }
      this.isLoaded = true;
      this.common.dismissLoader()
    }).catch(err => console.log(err))
  }
  async fetchNearMeProperties(loadMore?: boolean, loadingEvent?) {
    // this.locationData = {latitude:"-26.0627189",longitude:"28.07157637"}
    this.locationData = this.utilityService.getLocationData();
    if (!this.locationData || !this.locationData.latitude || !this.locationData.longitude) {
      this.properties = []
      this.common.presentToast('Unable to access GPS coordinates currently.!')
      return;
    }
    //?country=za&find=near_me&offset=0&limit=10&lat=-26.107567&long=28.056702&distance=5
    let params = {
      country: this.locationData && this.locationData.countryCode ? this.locationData.countryCode.toLowerCase() : 'za',
      find: 'near_me',
      offset: this.nearMePropertiesOffset,
      limit: 10,
      lat: this.locationData.latitude,
      long: this.locationData.longitude,
      distance: this.userSettings.nearMeRadius
    }
    this.nearMeRadius = this.userSettings.nearMeRadius
    this.isLoaded = false;
    this.common.presentLoader();
    if (this.userData.myRoles.length == 1 && this.userData.myRoles[0] == '4') {
      params['role'] = '4'
    }
    this.propertyDataService.getFeaturedOrNearMeProperties(params).toPromise().then(res => {
      this.isLoaded = true;
      if (res && res['results']) {
        this.userMgmtSrvc.nearMeRadiusUpdated = false;  //reset the flag for checking if radius updated
        if (loadMore) {
          this.nearMeProperties = [...this.nearMeProperties, ...res['results']]
        }
        else {
          this.nearMeProperties = res['results']
        }
        this.properties = cloneDeep(this.nearMeProperties)
        this._renderDataFromServer(this.properties)
        if (res['results'].length < 10 || (res['results'].length == res['total'])) {
          //no more properties are present in server
          this.infiniteScroll.disabled = true;
        }
        else {
          this.infiniteScroll.disabled = false;
        }
      }
      if (loadingEvent) {
        loadingEvent.target.complete();
      }
      this.common.dismissLoader()
    }).catch(err => console.log(err))
  }

  loadData(event) {
    setTimeout(() => {
      if (!this.userSettings.nearMeToggle && !this.userSettings.filtersActive) {
        //featured listing is present on screen
        this.feturedPropertiesOffset += 10;
        this.fetchFeaturedProperties(true, event)
      }
      else if (this.userSettings.nearMeToggle) {
        //near me listing is present on screen
        this.nearMePropertiesOffset += 10;
        this.fetchNearMeProperties(true, event)
      }
      else {
        //filtered lisitng is present on screen
        this.filteredPropertiesOffset += 10;
        this.init(false, event, true)
        // event.target.complete();
      }
    }, 500);
  }
  doRefresh(event) {
    if (!this.userSettings.nearMeToggle && !this.userSettings.filtersActive) {
      //featured listing is present on screen
      this.feturedPropertiesOffset = 0;
      this.fetchFeaturedProperties(false, event)
    }
    else if (this.userSettings.nearMeToggle) {
      //near me listing is present on screen
      this.nearMePropertiesOffset = 0;
      this.fetchNearMeProperties(false, event)
    }
    else {
      //filtered lisitng is present on screen
      this.filteredPropertiesOffset = 0;
      this.init(false, event)
      // event.target.complete();
    }

    // setTimeout(() => {
    //   //this is so that the spinner 
    // }, 2000);
    // console.log('Begin async operation');

    // setTimeout(() => {
    //   console.log('Async operation has ended');
    //   event.target.complete();
    // }, 2000);
  }
  async ionViewWillLeave() {
    let topLoader = await this.loadingCtrl.getTop();
    if (topLoader) {
      topLoader.dismiss();
    }
  }
  ngOnDestroy() {
    this.pageSubscriptions.unsubscribe()
  }
  setIntervalForUserActiveCheck() {
    //this is applicable for sellers and landlords, device has to check if the user has been activated by admin
    //TODO fix this once push notifications are done

    let timer = setInterval(() => {
      this.userMgmtSrvc.checkForIsActive().toPromise().then(res => {
        if (res && res['is_active'] == '1' && this.userData['id'] == res['account_id']) {
          if (this.userData['is_active'] == '0') {
            //user has been activated
            this.userData['is_active'] = res['is_active']
            this.userMgmtSrvc.updateUser(this.userData)
            this.intervalActive = false;
            clearInterval(timer)
          }
        }
      })
    }, 300000);
  }
}