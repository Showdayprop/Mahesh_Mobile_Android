import { Common } from './../../../shared/common';
import { UtilityService } from './../../../providers/utilities.service';
import { GlobalSearchService } from './../../../providers/global-search.service';
import { IonSlides, ModalController, NavController, MenuController } from '@ionic/angular';
import { DirectoryService } from './../../../providers/directory.service';
import { StorageService } from './../../../providers/storage.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EstateSearchComponent } from '../../../components/estate-search/estate-search.component';
import * as L from 'leaflet';
import * as MC from 'leaflet.markercluster';
import { ProviderDetailComponent } from '../provider-detail/provider-detail.component';


@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
})
export class ProvidersListComponent implements OnInit {
  @ViewChild('slides', { static: false }) slides: IonSlides;
  map;

  list;
  category: any;
  subCatSelected;
  subCatSelectedNames;
  limit = 10;
  offset = 0;
  selectedEstate;
  locationSelected;
  locationsNearMe: any;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 5,
    speed: 600,
    centeredSlides: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  }
  locationData;
  dblclik = false;
  blueIcon: { icon: any; };
  greenIcon: { icon: any; };
  redIcon: { icon: any; };
  isLoading: boolean = false;
  catArray;
  showkeys = true;
  userLoc: any;
  isFirstLoad = true;
  markers: any;
  // counterA = [{ "lat": 45.2550334, "lon": 19.7978803, "time": 1540364244870 }, { "lat": 45.2550334, "lon": 19.7978803, "time": 1540364282097 }, { "lat": 45.2475487, "lon": 19.807621, "time": 1540364385096 }, { "lat": 45.2490351, "lon": 19.8207229, "time": 1540364539163 }, { "lat": 45.2489981, "lon": 19.8304427, "time": 1540364641712 }, { "lat": 45.2488709, "lon": 19.8334196, "time": 1540364681323 }, { "lat": 45.2476786, "lon": 19.8373982, "time": 1540364737000 }, { "lat": 45.2477302, "lon": 19.8384019, "time": 1540364768000 }, { "lat": 45.2516465, "lon": 19.8729245, "time": 1540365187554 }, { "lat": 45.249868, "lon": 19.8735951, "time": 1540366069000 }, { "lat": 45.2542204, "lon": 19.853323, "time": 1540366288000 }, { "lat": 45.2539458, "lon": 19.8485, "time": 1540366348000 }, { "lat": 45.2537263, "lon": 19.8433869, "time": 1540366426000 }, { "lat": 45.2615551, "lon": 19.8541672, "time": 1540381125116 }, { "lat": 45.2521957, "lon": 19.8546798, "time": 1540381268980 }, { "lat": 45.2515052, "lon": 19.8515244, "time": 1540381315539 }, { "lat": 45.2505832, "lon": 19.8487765, "time": 1540381410812 }, { "lat": 45.2492798, "lon": 19.8476679, "time": 1540382563742 }, { "lat": 45.2454544, "lon": 19.8469038, "time": 1540382611606 }, { "lat": 45.2411987, "lon": 19.8299902, "time": 1540382834000 }, { "lat": 45.2401456, "lon": 19.8255812, "time": 1540383027621 }, { "lat": 45.2476653, "lon": 19.816888, "time": 1540383111444 }, { "lat": 45.2551062, "lon": 19.8029284, "time": 1540535414181 }, { "lat": 45.2577839, "lon": 19.8181254, "time": 1540535585523 }, { "lat": 45.2589245, "lon": 19.8223933, "time": 1540535714373 }, { "lat": 45.2616727, "lon": 19.836012, "time": 1540535829892 }, { "lat": 45.2626586, "lon": 19.83972, "time": 1540535861000 }, { "lat": 45.263857, "lon": 19.8438241, "time": 1540559238857 }, { "lat": 45.2641404, "lon": 19.8438206, "time": 1540559251000 }, { "lat": 45.2672106, "lon": 19.8431438, "time": 1540559382005 }, { "lat": 45.2696022, "lon": 19.8352366, "time": 1540559557000 }, { "lat": 45.2696508, "lon": 19.8328701, "time": 1540559713422 }, { "lat": 45.2648633, "lon": 19.8181607, "time": 1540559828189 }, { "lat": 45.2617608, "lon": 19.8127826, "time": 1540559897000 }, { "lat": 45.2605944, "lon": 19.8098642, "time": 1540560099156 }];
  constructor(private activatedRoute: ActivatedRoute,
    private storageSrvc: StorageService,
    public directorySrvc: DirectoryService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private utilityService: UtilityService,
    private menu: MenuController,
    public common: Common,
    private globalSearchSrvc: GlobalSearchService) {
    this.utilityService.refreshLocationData()
    this.menu.swipeGesture(false)
    this.category = this.directorySrvc.selectedCategory
    this.subCatSelected = this.activatedRoute.snapshot.queryParams['selectedSub']
    this.isLoading = true;
    this.userLoc = this.utilityService.getLocationData();
    this.directorySrvc.getMarkerLocations({
      cats: this.category['service_id'],
      subcats: this.subCatSelected ? this.subCatSelected : "",
      c_code: 'za',
      lat: this.userLoc && this.userLoc.latitude ? this.userLoc.latitude : '-26.034294',
      long: this.userLoc && this.userLoc.longitude ? this.userLoc.longitude : '28.066144'
    }).toPromise().then(data => {
      this.locationData = data
      if (!this.locationData || this.locationData.length == 0) {
        //nothing found
        this.common.presentPopupAlertForOK('No service providers found for the selected category in your city.', 'Alert')
      }
      setTimeout(() => {
        this.leafletMap();
      }, 1000);
    }).catch(err => {
      console.log(err)
    }).finally(() => this.isLoading = false)
    this.directorySrvc.getCalculatedCategories({
      cats: this.category['service_id'],
      subcats: this.subCatSelected ? this.subCatSelected : ""
    }).toPromise().then(data => {
      this.catArray = JSON.stringify(data)
    })
    /* if (!this.category) {
      //empty, search local
      this.storageSrvc.getObject('categories').then(data => {
        if (data) {
          this.category = data.find(el => el.service_type_slug == this.activatedRoute.snapshot.queryParams['parent_category'])
        }
      })
    }
    this.storageSrvc.getObject(this.activatedRoute.snapshot.queryParams['parent_category']).then(data => {
      if (data) {
        this.list = data
      }
      else {
        this.getListOfAffiliates({
          subservices: this.subCatSelected
        }, true);
      }
    }) */
    this.slideOpts['pagination'] = {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 4,
      hideOnClick: false,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + (index + 1) + '</span>';
      },
    }
    // this.nearMeLocations();
  }

  ngOnInit() {
    console.log('ngOnInit')
    this.defineMarkerIcons();
  }
  defineMarkerIcons() {
    this.blueIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/bluepointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
    this.greenIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/greenpointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
    this.redIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/redpointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
  }

  /* ionViewWillEnter() {
    console.log('ionViewWillEnter')
    this.globalSearchHandler();
  } */
  ionViewDidEnter() {
    if (!this.isFirstLoad) {
      //user was already on this page when a new search query was selected, so this should catch it and refresh the markers
      let data = this.globalSearchSrvc.searchResult.getValue()
      if (data && data['parent_id']) {
        this.isLoading = true;
        let subcats: any = [];
        if (data['service_id']) {
          subcats.push(data['service_id'])
        }
        this.catArray = JSON.stringify(subcats);
        this.directorySrvc.getMarkerLocations({
          cats: data['parent_id'],
          subcats: this.catArray,
          c_code: 'za',
          lat: this.userLoc && this.userLoc.latitude ? this.userLoc.latitude : '-26.034294',
          long: this.userLoc && this.userLoc.longitude ? this.userLoc.longitude : '28.066144'
        }).toPromise().then(data => {
          this.locationData = data
          if (!this.locationData || this.locationData.length == 0) {
            //nothing found
            this.common.presentPopupAlertForOK('No service providers found for the selected category in your city.', 'Alert')
          }
          if (this.map.hasLayer(this.markers)) {
            this.map.removeLayer(this.markers);
          }
          delete this.list;
          this.addMarkerCluster()
        }).catch(err => {
          console.log(err)
        }).finally(() => this.isLoading = false)
      }
    }
    else this.isFirstLoad = false;
  }
  leafletMap() {

    if (!this.userLoc) {
      this.userLoc = {
        latitude: "-26.034294",
        longitude: "28.066144"
      }
    }
    this.map = L.map('mapId', { "tap": false }).setView(
      [this.userLoc.latitude, this.userLoc.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
    // L.marker([userLoc.latitude, userLoc.longitude], this.blueIcon).bindPopup("<b>Your Location</b>").on("click", function (e) {
    //   console.log('asds')
    // }).addTo(this.map);
    // markers.addLayer(L.marker(L.getRandomLatLng(this.map)));
    this.addMarkerCluster();
  }

  addMarkerCluster() {
    this.markers = new MC.MarkerClusterGroup();
    this.locationData.forEach(a => {
      let marker: any;
      if (a.area && a.area_lat && a.area_long) {
        marker = L.marker(new L.LatLng(a.area_lat, a.area_long), this.blueIcon)
        marker.bindPopup("<b>Area</b><br>" + a.area + "<br>Providers : " + a.count).on("click", (e) => {
          this.markerClick(e, a);
        });
      }
      else if (a.estate && a.estate_lat && a.estate_long) {
        marker = L.marker(new L.LatLng(a.estate_lat, a.estate_long), this.redIcon)
        marker.bindPopup("<b>Estate</b><br>" + a.estate + "<br>Providers : " + a.count).on("click", (e) => {
          this.markerClick(e, a);
        });
      }
      else if (a.lat && a.long) {
        marker = L.marker(new L.LatLng(a.lat, a.long), this.greenIcon)
        marker.bindPopup("<b>Shop</b><br>").on("click", (e) => {
          this.markerClick(e, a);
        });
      }
      this.markers.addLayer(marker);
    });
    this.map.addLayer(this.markers);
  }
  markerClick(e, a) {
    console.log(a)
    // let param: any=[];
    // if (a && a.area_id) {
    //   param['area_id'] = a.area_id
    // }
    // else if (a && a.estate_id) {
    //   param['estate_id'] = a.estate_id
    // }
    this.isLoading = true;
    delete this.list
    let param: any;
    if (a.area_id) {
      param = { area_id: a.area_id, cat_array: this.catArray };
    }
    else if (a.estate_id) {
      param = { estate_id: a.estate_id, cat_array: this.catArray }
    }
    else if (a.lat && a.long) {
      param = { lat: a.lat, long: a.long, cat_array: this.catArray }
    }
    this.directorySrvc.getLocationServices(param).toPromise().then(res => {
      this.list = res
    }).catch(err => console.log(err)).finally(() => this.isLoading = false)
  }

  presentKeys() {

  }
  /* subSelected() {

    let extras = {
      subservices: this.subCatSelected,
    }
    if (this.locationSelected) {
      extras['localities'] = [this.locationSelected.area_id]
      extras['selected_city'] = this.locationSelected.city_id
    }
    this.getListOfAffiliates(extras);
    // this.getListOfAffiliates({
    //   subservices: this.subCatSelected,
    //   localities: this.locationSelected ? [this.locationSelected.area_id] : null
    // });
  }

  getListOfAffiliates(extras, isFirstLaunch?) {
    this.directorySrvc.getAffiliates({
      country_sel: "202",
      parent_category: this.activatedRoute.snapshot.queryParams['parent_category'],
      offset: this.offset,
      limit: this.limit,
      extra_filters: extras
    }).toPromise().then(d => {

      if (this.offset == 0) {
        this.list = d;
        if (isFirstLaunch) this.storageSrvc.setObject(this.activatedRoute.snapshot.queryParams['parent_category'], d)
      }
    })
  }

  async selectEstate() {
    const modal = await this.modalCtrl.create({
      component: EstateSearchComponent
    });
    modal.onDidDismiss().then(({ data }) => {
      if (data) {
        this.processEstateSelection(data)
      }
    })
    return await modal.present();
  }
  processEstateSelection(data: any) {
    let extras = {
      "selected_city": data.city_id,
      "localities": [data.area_id]
    }
    if (this.subCatSelected) {
      extras['subservices'] = this.subCatSelected
    }
    this.locationSelected = data;
    if (data.community_name && data.community_id) {
      this.selectedEstate = data.community_name + ', ';
    }
    else {
      this.selectedEstate = '';
    }
    this.selectedEstate = this.selectedEstate + data.area + ', ' + data.city
    this.getListOfAffiliates(extras)
  }

  globalSearchHandler() {
    let result = this.globalSearchSrvc.searchResult.getValue();
    if (result) {
      switch (result.type) {
        case 'categories':
          if (!result.subcategories) this.subCatSelected = result.service_id
          break;

        case 'nearMe':
        case 'location':
          this.processEstateSelection(result)
          break;

        default:
          break;
      }
    }
  }
 */
  async openProviderDetailModal(item) {
    this.common.presentLoader();
    let data = await this.directorySrvc.getServicesForProvider({ id: item.account_id }).toPromise();
    const modal = await this.modalCtrl.create({
      component: ProviderDetailComponent,
      componentProps: {
        item: item,
        data: data
      }
    });
    this.common.dismissLoader();
    return await modal.present();
  }
  navigateBack() {
    this.globalSearchSrvc.requireCategorySelection = false;
    delete this.directorySrvc.selectedCategory;
    this.navCtrl.navigateBack(['../categories'], {
      relativeTo: this.activatedRoute
    })
  }
  ngOnDestroy() {
    this.map.remove();
    this.menu.swipeGesture(true)
    // this.globalSearchSrvc.searchResult.unsubscribe()
  }
}
