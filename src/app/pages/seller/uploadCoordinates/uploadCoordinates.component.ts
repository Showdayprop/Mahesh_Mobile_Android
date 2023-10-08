import { DirectoryService } from './../../../providers/directory.service';
import { UtilityService } from './../../../providers/utilities.service';
import { LoggerService } from './../../../core/logger.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, PopoverController } from '@ionic/angular';
import { Common } from '../../../shared/common';
import { PropertiesService } from '../../../providers/properties.service';
import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import cloneDeep from 'lodash.clonedeep';

// const { Geolocation } = Plugins;
declare var google;
@Component({
  selector: 'app-upload-coordinates',
  templateUrl: './uploadCoordinates.component.html',
  styleUrls: ['./uploadCoordinates.component.scss'],
})
export class UploadCoordinatesComponent implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: any;
  longitude: any;
  autocomplete: { input: string; };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  googleGeocoder: any
  areaName = '';
  countryCode;
  page;
  property;
  locationForm: FormGroup;
  popoverFlag: boolean = false;
  firstLoad: boolean = true;
  loadingSearchResults: boolean = false;
  userLoc: any;

  constructor(public zone: NgZone,
    private propertiesSrvc: PropertiesService,
    private common: Common,
    private navCtrl: NavController,
    private geolocation: Geolocation,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private popoverCtrl: PopoverController,
    private utilityService: UtilityService,
    private nativeGeocoder: NativeGeocoder,
    private directorySrvc: DirectoryService) {
    this.page = this.activatedRoute.snapshot.queryParams.page;
    this.property = this.propertiesSrvc.newProperty.getValue();
    // this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.googleGeocoder = new google.maps.Geocoder();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
    this.userLoc = this.utilityService.getLocationData();
    if (!this.userLoc) {
      this.userLoc = {
        latitude: "-26.034294",
        longitude: "28.066144"
      }
    }
  }

  ngOnInit() {
    this.locationForm = this.formBuilder.group({
      complex_name: [this.property.complex_name],
      house_no: [this.property.house_no]
    })
  }

  ionViewWillEnter() {
    if (this.page == 'service') {
      if (this.directorySrvc.serviceCoordinates) {
        this.initMap(this.directorySrvc.serviceCoordinates.lat, this.directorySrvc.serviceCoordinates.long)
      }
      else this.initMap(this.userLoc.latitude, this.userLoc.longitude)
      return;
    }
    this.property = this.propertiesSrvc.newProperty.getValue();
    this.locationForm.controls.complex_name.setValue(this.property.complex_name);
    this.locationForm.controls.house_no.setValue(this.property.house_no);
    this.areaName = this.property && this.property.area ? this.property.area : '';
    if (!this.firstLoad && this.property && this.property.property_latitude && this.property.property_longitude && this.property.property_latitude != 0 && this.property.property_longitude != 0) {
      this.latitude = this.property.property_latitude;
      this.longitude = this.property.property_longitude;
      this.logger.log("uploadCoordinates : ionViewWillEnter : Set from existing prop :", this.latitude, this.longitude)
      this.reverseGeocodeGoogle(this.latitude, this.longitude);
    }
    else if (this.firstLoad && this.property && this.property.property_latitude && this.property.property_longitude && this.property.property_latitude != 0 && this.property.property_longitude != 0) {
      this.logger.log("uploadCoordinates : ionViewWillEnter : init map from existing prop :", this.property.property_latitude, this.property.property_longitude)
      this.initMap(this.property.property_latitude, this.property.property_longitude);
    }
    else {
      this.logger.log("uploadCoordinates : ngOnInit : init from user location :")
      this.loadMap();
    }
    this.firstLoad = false;
  }
  initMap(lat, long) {
    this.latitude = lat;
    this.longitude = long;
    let latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(long));
    this.logger.log("uploadCoordinates : initMap :", parseFloat(lat), parseFloat(long))
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    if (this.page == "service") {
      //if the page is from service provider, listen to drag event
      this.map.addListener('dragend', () => {

        this.latitude = this.map.center.lat();
        this.longitude = this.map.center.lng();

        // this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });
      return;
    }
    this.reverseGeocodeGoogle(this.latitude, this.longitude);
  }
  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      // Geolocation.getCurrentPosition().then((resp)=>{
      this.logger.log("uploadCoordinates : loadMap :", resp.coords.latitude, resp.coords.longitude)
      this.initMap(resp.coords.latitude, resp.coords.longitude)
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  reverseGeocodeGoogle(latitude, longitude) {
    if (this.page == "service") {
      //if the page is from service provider, return without triggerring reversegeocode, not requried
      return;
    }
    let latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    this.googleGeocoder.geocode({ 'location': latlng }, (results, status) => {
      if (status === 'OK') {
        this.countryCode = results[0].address_components.find(el => el.types.includes('country')).short_name;
        this.logger.log("uploadCoordinates : reverseGeocodeGoogle :", results[0])
        this.areaName = results[0].address_components.find(el => el.types.includes('sublocality')).long_name;
        this.address = results[0].formatted_address;
      }
      else {
        this.common.presentToast('Geocoder failed due to: ' + status);
      }
    });
  }


  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults() {
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.loadingSearchResults = true;
    this.googleGeocoder.geocode({
      'address': this.autocomplete.input,
      componentRestrictions: { country: 'za' }
    }, (results, status) => {
      this.loadingSearchResults = false;
      if (status === 'OK') {
        this.autocompleteItems = [];
        this.zone.run(() => {
          this.autocompleteItems = results;
        });
      } else {
        this.common.presentToast('Geocode was not successful for the following reason: ' + status);
      }
    })
  }

  itemSelected(item) {
    delete this.autocompleteItems;
    if (item.address_components) {
      this.areaName = item.address_components.find(el => el.types.includes('sublocality')).long_name;
      this.map.panTo(new google.maps.LatLng(item.geometry.location.lat(), item.geometry.location.lng()))
      this.address = item.formatted_address;
      this.latitude = item.geometry.location.lat();
      this.longitude = item.geometry.location.lng();
      this.countryCode = item.address_components.find(el => el.types.includes('country')).short_name;
    }
    else {
      delete this.areaName;
    }
  }

  ClearAutocomplete() {
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }

  finish() {
    this.common.presentLoader();
    let data: any = {
      "area": this.areaName,
      "countryCode": this.countryCode,
      "property_latitude": this.latitude,
      "property_longitude": this.longitude,
      "propID": this.property.id,
      ...this.locationForm.value
    }
    this.propertiesSrvc.addPropertyCoordinates(data).toPromise().then(res => {
      if (this.page == 'detailed') {
        data = { ...this.property, ...data };
        this.property = cloneDeep(data);
        this.propertiesSrvc.newProperty.next(data);
        this.navCtrl.navigateForward(['../upload-multiple-images'], { relativeTo: this.activatedRoute })
      }
      else {
        this.propertiesSrvc.changePropertyVisibility({ id: this.property.id, change: 'Unhide' }).toPromise().then(res => {
          if (res == 'success') {
            this.common.presentToast('The Property has been listed successfully.!', null, 4000, 'success')
          }
          this.propertiesSrvc.newProperty.next(null);
          this.navCtrl.navigateRoot('/seller')
        })
      }
    }).catch(err => {
      if (err && err.error) {
        this.common.presentToast(err.error)
      }
    }).finally(() => {
      this.common.dismissLoader();
    })
  }
  exit() {
    this.common.presentAlertForConfirmation('exit_new_property', 'Confirm').then(() => {
      this.propertiesSrvc.newProperty.next(null)
      this.propertiesSrvc.editedProperty.next(true);
      this.propertiesSrvc.needListingRefresh = true;
      this.navCtrl.navigateRoot('/seller')
    })
  }

  //For service provider location selection
  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
      });

  }
  saveCoordinates() {
    console.log(this.latitude)
    console.log(this.longitude)
    this.directorySrvc.serviceCoordinates = { lat: this.latitude, long: this.longitude }
    this.navCtrl.back();
  }
  clear() {
    delete this.directorySrvc.serviceCoordinates;
    this.navCtrl.back();
  }
}
