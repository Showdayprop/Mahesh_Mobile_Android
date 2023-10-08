import { UtilityService } from './../../../providers/utilities.service';
import { ChatService } from './../../../providers/chat.service';
import { LoggerService } from './../../../core/logger.service';
import { NotificationService } from './../../../providers/notification.service';
import { GlobalConfigService } from './../../../providers/global-config.service';
import { UserManagementService } from './../../../providers/user-management.service';
import { GlobalSearchService } from './../../../providers/global-search.service';
import { Common } from './../../../shared/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DirectoryService } from '../../../providers/directory.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  // @ViewChildren('subcategorySelect') subcategorySelect: QueryList<IonSelect>;
  @ViewChild('subcategorySelect', { static: false }) subcategorySelect: IonicSelectableComponent;
  categories;
  selectedCategory;
  selectedSubs;
  _unsubscribe = new Subscription();
  constructor(private directorySrvc: DirectoryService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private common: Common,
    private globalSearchSrvc: GlobalSearchService,
    private userMgmtSrvc: UserManagementService,
    private globalConfigSrvc: GlobalConfigService,
    private notificationSrvc: NotificationService,
    private logger: LoggerService,
    public chatSrvc: ChatService,
  public utilitySrvc:UtilityService) {
    this.directorySrvc.directoryCategories.pipe(take(2)).subscribe(data => {
      this.categories = data
      console.log(data)
    })
  }

  ngOnInit() {
    /* this.storageSrvc.getItem('preferencesInServerOnce').then(d => {
      if (!d) {
        this.common.presentToast('Customize alert preferences to stay updated.!', '', 10000, 'medium', true, 'Configure').then(d => {
          if (d.role == 'cancel') {
            // take the user to preferences tab
            this.navCtrl.navigateForward('/alerts-filters')
          }
        })
      }
    }) */
  }
  ionViewWillEnter() {
    delete this.selectedSubs;
    let searchResult = this.globalSearchSrvc.searchResult.getValue()
    if (this.globalSearchSrvc.requireCategorySelection && searchResult) {
      this.globalSearchSrvc.requireCategorySelection = false;
      this.common.presentPopupAlertForOK('Please select a category before proceeding')
    }
  }
  selected(item) {
    if (item.service_type_slug == 'for-sale' || item.service_type_slug == 'for-rent' || item.service_type_slug == 'on-show') {
      this.setFilters(item.service_type_slug)
      return this.navCtrl.navigateRoot('/home')
    }
    else if (item == 'properties') return;
    else if (item.service_type_slug == 'chat') {
      this.navCtrl.navigateForward(['/chat'], {
        relativeTo: this.activatedRoute
      })
      return;
    }
    this.selectedCategory = item;
    this.directorySrvc.selectedCategory = item;
    // let multiElement = this.subcategorySelect.find(el => el.name == item.service_type_slug)
    if (this.subcategorySelect && item.subcategories && item.subcategories) {
      this.subcategorySelect.open()
    }
    else {
      //no sub category available, filter on the main category
      this.navCtrl.navigateForward(['../providers-list'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parent_category: item.service_id
        }
      })
    }
  }
  selectedSub(event: {
    component: IonicSelectableComponent,
    value: any
  }, item) {
    // if (selectedValues.length == 0) {
    //   return;
    // }
    // else {
    //navigate to next page with the list of sub categories
    this.navCtrl.navigateForward(['../providers-list'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        parent_category: item.service_id,
        selectedSub: JSON.stringify(event.value.map(el => el.service_id))
      }
    })
    // }
  }

  setFilters(item) {
    let params = environment.defaultFilters;
    if (item == 'for-rent') {
      params.requirement = 'rent';
      this.userMgmtSrvc.isOnlyRentProperties.next(true)
    }
    else {
      params.requirement = 'sale';
      this.userMgmtSrvc.isOnlyRentProperties.next(false)
    }
    let userSettings = this.userMgmtSrvc.userSettings.getValue();
    this.userMgmtSrvc.updateUserFilters(params)
    userSettings['filtersActive'] = true;
    userSettings['nearMeToggle'] = false;
    this.userMgmtSrvc.updateUserSettings(userSettings)

    //push the app prefrences to the server
    let preferencesInServerOnce = this.globalConfigSrvc.preferencesInServerOnce;
    if (!preferencesInServerOnce) {
      //the settings have never been updated in the server, update them
      this.common.presentToast('Configure your area and alert filter now!', '', 10000, 'medium', true, 'Configure').then(d => {
        if (d.role == 'cancel') {
          // take the user to preferences tab
          this.navCtrl.navigateForward('/alerts-filters')
        }
      })
      this.notificationSrvc.setAlertPreferences(params).toPromise().then(res => {
        this.globalConfigSrvc.setPreferencesInServerOnceFlag(true);
        preferencesInServerOnce = true;
        this.logger.log('categoriesComponent : setFilters : Preferences updated in the server')
      }).catch(err => {
        console.log(err);
      })
    }
    else {
      this.logger.log('categoriesComponent : setFilters : preferencesInServerOnce : ' + preferencesInServerOnce)
    }
  }

  toggleItems() {
    this.subcategorySelect.toggleItems(this.subcategorySelect.itemsToConfirm.length ? false : true);
    // this.confirm();
  }

  confirm() {
    this.subcategorySelect.confirm();
    this.subcategorySelect.close();
  }

  ngOnDestroy() {
    // this._unsubscribe.unsubscribe();
  }

}
