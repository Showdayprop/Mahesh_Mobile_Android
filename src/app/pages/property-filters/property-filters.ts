import { GlobalConfigService } from './../../providers/global-config.service';
import { NotificationService } from './../../providers/notification.service';
import { ActivatedRoute } from '@angular/router';
import { SearchPopoverListComponent } from './../../components/search-popover-list/search-popover-list.component';
import { Common } from './../../shared/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController } from '@ionic/angular';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { UtilityService } from '../../providers/utilities.service';
import { PropertiesService } from '../../providers/properties.service';
import { AuthenticationService } from '../../providers/authentication.service';
import { UserManagementService } from '../../providers/user-management.service';
import { priceOptions } from '../../shared/static_values';
import cloneDeep from 'lodash.clonedeep';
import { environment } from '../../../environments/environment';

const { Storage } = Plugins;

@Component({
  selector: 'property-filters',
  templateUrl: 'property-filters.html',
  styleUrls: ['./property-filters.scss']
})

export class PropertyFiltersPage {
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredAreas: Observable<string[]>;
  areas: any[] = []; // string[] = []
  allAreas: any = [];
  requirementsConfig: Observable<string[]>;
  houseTypesConfig: Observable<string[]>;
  statesConfig: any;
  citiesConfig: [];
  locationData: any;
  userData: any;
  roomsConfig = [{
    id: 1,
    label: 'One'
  }, {
    id: 2,
    label: 'Two'
  }, {
    id: 3,
    label: 'Three'
  }, {
    id: 4,
    label: 'Four'
  }, {
    id: 5,
    label: 'Five +'
  }];

  filterForm = new FormGroup({
    requirement: new FormControl('', Validators.required),
    house_type: new FormControl(''),
    bedrooms_select: new FormControl(''),
    bathrooms_select: new FormControl(''),
    minimum_price: new FormControl(''),
    maximum_price: new FormControl('')
  });
  priceOpts = priceOptions;
  maxPriceSliceStartIndex = 0;
  minPriceSliceEndIndex = this.priceOpts.length;

  // @ViewChild('areaInput', {static: true}) areaInput: ElementRef<HTMLInputElement>;
  // @ViewChild('auto', {static: true}) matAutocomplete: MatAutocomplete;

  preSelectedStateId: any;
  preSelectedCityId: any;
  preSelectedStateName: string;
  preSelectedCityName: string;
  preSelectedRequirement: string;
  userFilters: any;
  userSettings: any;
  isLoaderPresent: boolean = false;
  searchResult;
  popoverFlag: boolean = false;
  selectedArea;
  filterNumber = 0;
  showCount: boolean = false;
  selectedAreas: any = [];
  page;
  saveAlert: boolean = false;
  isAlertPage = false;
  alertPref;
  // preferencesInServerOnce: any;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastController: ToastController,
    public utilityService: UtilityService,
    public propertiesService: PropertiesService,
    public authService: AuthenticationService,
    public userMgmtSrvc: UserManagementService,
    private common: Common,
    private popoverCtrl: PopoverController,
    private activatedRoute: ActivatedRoute,
    private globalConfigSrvc: GlobalConfigService,
    private notificationSrvc: NotificationService
  ) {
    // this.saveAlert = !this.globalConfigSrvc.preferencesInServerOnce;
    this.page = this.activatedRoute.snapshot.queryParams.page;
    if (this.page && this.page == 'alerts') {
      this.isAlertPage = true;
      this.saveAlert = true;
      this.alertPref = this.activatedRoute.snapshot.data['data'];
      if (this.alertPref && this.alertPref.is_active != undefined) {
        this.saveAlert = this.alertPref.is_active == 1 ? true : false;
      }
      else if (!this.alertPref || this.alertPref.length == 0) {
        // no alert preference, so pick default
        this.alertPref = environment.defaultFilters;
      }
    }
    if (this.utilityService.houseTypes && this.utilityService.houseTypes.length > 0) {
      this.houseTypesConfig = this.utilityService.houseTypes
    }
    else {
      this.utilityService.getHouseTypes().then(res => {
        this.houseTypesConfig = res
      })
    }
    if (this.utilityService.requirements && this.utilityService.requirements.length > 0) {
      this.requirementsConfig = this.utilityService.requirements
    }
    else {
      this.utilityService.getRequirements().then(res => {
        this.requirementsConfig = res
      })
    }

    this.loadDefaultData();
  }

  loadDefaultData() {
    this.userData = this.userMgmtSrvc.user.getValue();
    this.userFilters = this.userMgmtSrvc.userFilters.getValue()
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
    let existingSettings: any;
    if (this.isAlertPage && this.alertPref && typeof (this.alertPref) == "object" && Object.keys(this.alertPref).length != 0) {
      existingSettings = cloneDeep(this.alertPref);
    }
    else {
      existingSettings = cloneDeep(this.userFilters);
    }

    if (existingSettings && existingSettings.length != 0) {
      if (existingSettings.selectedAreas) {
        this.selectedAreas = existingSettings.selectedAreas
      }
      if (existingSettings.requirement) {
        this.preSelectedRequirement = existingSettings.requirement.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        this.filterForm.controls.requirement.setValue(existingSettings.requirement);
      }
      if (existingSettings.type_of_property) {
        this.filterForm.controls.house_type.setValue(existingSettings.type_of_property);
      }

      if (existingSettings.minimum_price) {
        this.filterForm.controls.minimum_price.setValue(existingSettings.minimum_price.toString());
      }

      if (existingSettings.maximum_price) {
        this.filterForm.controls.maximum_price.setValue(existingSettings.maximum_price.toString());
      }

      if (existingSettings.no_bedrooms) {
        this.filterForm.controls.bedrooms_select.setValue(existingSettings.no_bedrooms.toString());
      }

      if (existingSettings.no_bathrooms) {
        this.filterForm.controls.bathrooms_select.setValue(existingSettings.no_bathrooms.toString());
      }
    }
    else {
      if (this.userData.myRoles.length == 1 && this.userData.myRoles[0] == '4') {
        this.preSelectedRequirement = 'Rent';
        this.filterForm.controls.requirement.setValue('rent');
      }
      else {
        this.preSelectedRequirement = 'Sale';
        this.filterForm.controls.requirement.setValue('sale');
      }
    }
  }

  private _area(data: any) {
    const x = [];
    data.forEach(o => {
      x.push(o.id);
    });

    return x;
  }

  private _house_types(data: any) {
    const x = [];
    data.forEach(o => {
      x.push(o);
    });

    return x;
  }

  async save() {
    if (this.filterForm.valid && this.selectedAreas.length > 0) {
      let userData: any = this.userMgmtSrvc.user.getValue();
      const params: any = {
        requirement: this.getForm().requirement.value,
        areas: this.selectedAreas.map(el => el.area_id),
        selectedAreas: this.selectedAreas
      };

      if (this.getForm().house_type.value) {
        params.type_of_property = this._house_types(this.getForm().house_type.value);
      }

      if (this.getForm().minimum_price.value) {
        params.minimum_price = Number(this.getForm().minimum_price.value);
      }

      if (this.getForm().maximum_price.value) {
        params.maximum_price = Number(this.getForm().maximum_price.value);
      }

      if (this.getForm().bedrooms_select.value) {
        params.no_bedrooms = Number(this.getForm().bedrooms_select.value);
      }

      if (this.getForm().bathrooms_select.value) {
        params.no_bathrooms = Number(this.getForm().bathrooms_select.value);
      }

      if (this.isAlertPage || this.saveAlert) {
        params['is_active'] = this.saveAlert;
        this.common.presentLoader();
        this.notificationSrvc.setAlertPreferences(params).toPromise().then(res => {
          if (!this.globalConfigSrvc.preferencesInServerOnce) {
            this.globalConfigSrvc.setPreferencesInServerOnceFlag(true);
          }
          if (this.isAlertPage) {
            this.common.presentToast('Your Alert preferences have been saved.', undefined, 3000, 'success')
            this.navCtrl.navigateBack('home');
            // this.navCtrl.navigateRoot('/dashboard/categories')
          }
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          this.common.dismissLoader();
        })
        // this.propertiesService.savePropertyFilters(params).toPromise().then(response => {
        //   // if(!(Object.keys(response).length === 0 && response.constructor === Object)){
        //   this.common.presentToast('Your Alert preferences have been saved.',undefined,3000,'success')

        // });
      }
      if (!this.isAlertPage) {
        this.propertiesService.showday(params.areas,
          params.requirement,
          params.minimum_price,
          params.maximum_price,
          params.type_of_property,
          params.no_bedrooms,
          params.no_bathrooms,
          null,
          null, 'count').toPromise().then(res => {
            this.filterNumber = Number(res)
            this.showCount = true;
          })
        this.common.presentToast('Your property filters have been saved.', undefined, 3000, 'success')
        //check if rent was selected, and then toggle the flag
        if (this.getForm().requirement.value == "rent") {
          this.userMgmtSrvc.isOnlyRentProperties.next(true)
        }
        else {
          this.userMgmtSrvc.isOnlyRentProperties.next(false)
        }
        this.userMgmtSrvc.updateUserFilters(params)
        this.userSettings['filtersActive'] = true;
        this.userSettings['nearMeToggle'] = false;
        this.userMgmtSrvc.updateUserSettings(this.userSettings)
      }
    }
  }

  getForm() {
    return this.filterForm.controls;
  }
  clear() {
    this.userMgmtSrvc.updateUserFilters(null)
    this.selectedAreas = [];
    delete this.searchResult;
    this.filterForm.controls.minimum_price.setValue('');
    this.filterForm.controls.maximum_price.setValue('');
    this.userSettings['filtersActive'] = false;
    this.userMgmtSrvc.updateUserSettings(this.userSettings)
    this.showCount = false;
    // this.navCtrl.navigateBack('home');
  }
  clearSearch() {
    // delete this.selectedArea;
    delete this.searchResult
  }

  requirementChanged(value) {
    delete this.preSelectedRequirement
  }
  checkForDisable(type): boolean {
    if (type == 'city') {
      return this.getForm().state_select.value ? false : true
    }
    if (type == 'area') {
      return this.getForm().city_select.value ? false : true
    }
  }
  searchbarInteraction(event) {
    if (event.srcElement.value && this.searchResult && this.searchResult.indexOf(',') == -1) {
      this.utilityService.searchAreas(event.srcElement.value, this.locationData && this.locationData.countryCode ? this.locationData.countryCode : 'za').toPromise().then(res => {
        this.utilityService.areaSearchResults.next(res)
        // delete this.selectedArea
        this.popoverCtrl.getTop().then(r => {
          if (r) {
            this.popoverCtrl.dismiss();
          }
        })
        this.popoverFlag = false;
        // if(this.popoverFlag){
        // }
        setTimeout(() => {
          this.presentPopover(event)
        }, 200);
      })
    }
  }
  async presentPopover(ev) {
    const searchPopover = await this.popoverCtrl.create({
      component: SearchPopoverListComponent,
      event: ev,
      translucent: true,
      keyboardClose: false,
      mode: "ios",
      showBackdrop: true,
      backdropDismiss: true,
    })
    this.popoverFlag = true;
    await searchPopover.present();
    const { data } = await searchPopover.onDidDismiss()
    this.popoverCtrl.getTop().then(r => {
      if (r && data) {
        this.popoverCtrl.dismiss();
      }
    })
    if (data) {
      if (this.selectedAreas.filter(el => el.area_id == data.area_id).length == 0) {
        this.selectedAreas.push(data);
      }
      else {
        this.common.presentToast('Area has been selected already.!')
      }
      this.searchResult = ''
    }
    this.popoverCtrl
    this.popoverFlag = false;
  }

  removeAreaFromSearch(i, area) {
    this.selectedAreas.splice(i, 1)
  }

  priceSelected(type, event) {
    let index = this.priceOpts.findIndex(el => el.value == Number(event.target.value))
    if (event.target.value) {
      if (type == 'min') {
        this.maxPriceSliceStartIndex = index;
      }
      else {
        this.minPriceSliceEndIndex = index
      }
    }
    else {
      if (type == 'min') {
        this.maxPriceSliceStartIndex = 0;
      }
      else {
        this.minPriceSliceEndIndex = priceOptions.length
      }
    }
  }
  savePreferenceToggle() {
    if (this.isAlertPage) {
      // debugger
    }
  }
}
