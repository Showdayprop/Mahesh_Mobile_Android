import { Common } from './../../shared/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ProviderDetailComponent } from '../../pages/dashboard/provider-detail/provider-detail.component';
import { DirectoryService } from '../../providers/directory.service';
import { GlobalSearchService } from '../../providers/global-search.service';
import { UtilityService } from '../../providers/utilities.service';

@Component({
  selector: 'app-expansion-list',
  templateUrl: './expansion-list.component.html',
  styleUrls: ['./expansion-list.component.scss'],
})
export class ExpansionListComponent implements OnChanges, OnInit {
  @Input() type;
  @Input() searchString;
  @Output() isEmpty = new EventEmitter<any>();
  list;
  limit = 10;
  offset = 0;
  categories: any;
  loading: boolean = false;
  result;
  constructor(
    public directorySrvc: DirectoryService,
    private globalSearchSrvc: GlobalSearchService,
    private utilitiesSrvc: UtilityService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private common: Common,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges) {
    let change = changes['searchString']
    switch (this.type) {
      case 'nearMe':
        if (change.firstChange) this.initNearMe()
        break;

      case 'categories':
        this.initCategories(change.currentValue)
        break;

      case 'location':
        if (!change.firstChange) this.refetchLocation(change.currentValue)
        break;

      case 'provider':
        if (!change.firstChange) this.refetchProvider(change.currentValue)
        break;

      default:
        break;
    }
  }

  initNearMe() {
    this.loading = true;
    let geoResponse = {
      // coords: {
      lat: "-26.034294",
      long: "28.066144",
      code: "ZA"
      // }
    }
    this.utilitiesSrvc.getCurrentLocationFromServer(geoResponse).toPromise().then((res: any) => {
      this.list = res;
      (!this.list || this.list.length == 0) ? this.isEmpty.emit(true) : this.isEmpty.emit(false)
      // this.locationsFromServer = res.filter(el => el.estates.length > 0)
    }).finally(() => this.loading = false)
  }
  initCategories(str?) {
    if (!this.categories) {
      this.categories = this.directorySrvc.directoryCategories.getValue();
    }
    if (this.categories && str) {
      let dumplist = [];
      this.categories.forEach(element => {
        if (element.service_type.toLowerCase().indexOf(str.toLowerCase()) > -1) {
          dumplist.push(element)
        }
        if (element.subcategories && element.subcategories.length > 0) {
          element.subcategories.forEach(sub => {
            if (sub.service_type.toLowerCase().indexOf(str.toLowerCase()) > -1) {
              dumplist.push({ ...sub, parent_slug: element.service_type_slug, parent_id: element.service_id })
            }
          });
        }
      })
      this.list = dumplist;
      (!this.list || this.list.length == 0) ? this.isEmpty.emit(true) : this.isEmpty.emit(false)
    }
    this.loading = false;
  }
  refetchLocation(currentValue: any) {
    this.loading = true;
    this.utilitiesSrvc.searchAreas(currentValue.toLowerCase(), 'za', true).toPromise().then(res => {
      this.list = res;
      if (res['areas'] && res['estates'] && res['areas'].length == 0 && res['estates'].length == 0) {
        delete this.list;
      }
      (!this.list || this.list.length == 0) ? this.isEmpty.emit(true) : this.isEmpty.emit(false)
    })
    this.loading = false;
  }
  refetchProvider(currentValue: any) {
    this.loading = true;
    this.directorySrvc.searchAffiliates(currentValue.toLowerCase(), 'za').toPromise().then(res => {
      this.list = res;
      (!this.list || this.list.length == 0) ? this.isEmpty.emit(true) : this.isEmpty.emit(false)
    }).finally(() => this.loading = false)
  }

  searchSelected(value, item?) {
    switch (this.type) {
      case 'nearMe':
      case 'location':
        {
          if (item) {
            //estate selected
            this.result = {
              country: item.country,
              community_address: value.community_address,
              community_id: value.community_id,
              community_name: value.community_name,
              city: item.city.city,
              city_id: item.city.id,
              area: item.locality.area,
              area_id: item.locality.id,
              state: item.state.state,
              state_id: item.state.id
            }
          }
          else {
            this.result = { ...value }
          }
          this.result['type'] = this.type;
          this.navigate();
        }
        break;

      case 'categories':
        {
          this.result = {
            ...value,
            type: this.type
          }
          this.navigate();
        }
        break;

      default:
        break;
    }
    console.log(this.result)
  }

  navigate() {
    delete this.directorySrvc.selectedCategory;
    this.globalSearchSrvc.searchResult.next(this.result);

    if (this.type == 'categories') {
      //it is a category or sub category, navigate to list screen
      let parentId;
      let selecteSubs;
      if (this.result.parent_id) {
        this.directorySrvc.selectedCategory = this.categories.find(el => el.service_id == this.result.parent_id)
        parentId = this.result.parent_id
        selecteSubs = JSON.stringify([this.result.service_id])
      }
      else {
        this.directorySrvc.selectedCategory = this.result
        parentId = this.result.service_id
        selecteSubs = JSON.stringify(this.result.subcategories.map(el => el.service_id))
      }
      this.navCtrl.navigateForward(['../providers-list'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parent_category: parentId,
          selectedSub: selecteSubs
          // parent_category: this.result.parent_slug ? this.result.parent_slug : this.result.service_type_slug
        }
      })
    }
    else {
      //it is a location type, so check current url and see if category is already selected or not
      if (this.globalSearchSrvc.origin && this.globalSearchSrvc.origin.indexOf('providers-list') > -1) {
        //user on provider list screen, category already selected, so proceed
        let category_slug = this.globalSearchSrvc.origin.split('=')[1]
        this.navCtrl.navigateForward(['../providers-list'], {
          relativeTo: this.activatedRoute,
          queryParams: {
            parent_category: category_slug
          }
        })
      }
      else {
        //make the user select category first
        this.globalSearchSrvc.requireCategorySelection = true;
        this.navCtrl.navigateBack(['../categories'], {
          relativeTo: this.activatedRoute
        })
      }
    }
  }

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
    // modal.onDidDismiss().then(({ data }) => {
    //   if (data) {
    //     this.processEstateSelection(data)
    //   }
    // })
    this.common.dismissLoader();
    return await modal.present();
  }
}
