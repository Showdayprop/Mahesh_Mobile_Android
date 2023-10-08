import { UtilityService } from './../../providers/utilities.service';
import { DirectoryService } from './../../providers/directory.service';
import { Subscription } from 'rxjs';
import { GlobalSearchService } from './../../providers/global-search.service';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-full-search',
  templateUrl: './full-search.component.html',
  styleUrls: ['./full-search.component.scss'],
})
export class FullSearchComponent implements OnInit {
  _unsubscribe = new Subscription();
  result: any;
  sections = [
    // {
    //   title: 'Near Me',
    //   key: 'nearMe',
    //   isEmpty: true
    // },
    {
      title: 'Categories',
      key: 'categories',
      isEmpty: true
    }, {
      //   title: 'Estates/Areas',
      //   key: 'location',
      //   isEmpty: true
      // }, {
      title: 'Service Providers',
      key: 'provider',
      isEmpty: true
    }]

  searchString;
  constructor(public location: Location,
    public directorySrvc: DirectoryService,
    private globalSearchSrvc: GlobalSearchService,
    private utilitiesSrvc: UtilityService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute) {
    this._unsubscribe.add(this.globalSearchSrvc.searchInput.subscribe(data => {
      this.searchString = data
    }))
  }
  // searchSelected(value, type) {
  //   this.globalSearchSrvc.searchResult.next({
  //     ...value,
  //     type: type
  //   });

  //   if (type == 'sub-category') {
  //     delete this.directorySrvc.selectedCategory;
  //     this.navCtrl.navigateForward(['../providers-list'], {
  //       relativeTo: this.activatedRoute,
  //       queryParams: {
  //         parent_category: value.parent_slug
  //       }
  //     })
  //   }
  //   else if (type == 'provider') {

  //   }
  //   else {
  //     if (this.globalSearchSrvc.origin && this.globalSearchSrvc.origin.indexOf('providers-list') > -1) {
  //       //user on provider ist screen, category already selected, so proceed
  //       delete this.directorySrvc.selectedCategory;
  //       let category_slug = this.globalSearchSrvc.origin.split('=')[1]
  //       this.navCtrl.navigateForward(['../providers-list'], {
  //         relativeTo: this.activatedRoute,
  //         queryParams: {
  //           parent_category: category_slug
  //         }
  //       })
  //     }
  //     else {
  //       //make the user select category first
  //       this.globalSearchSrvc.requireCategorySelection = true;
  //       this.navCtrl.navigateBack(['../categories'], {
  //         relativeTo: this.activatedRoute
  //       })
  //     }
  //   }
  //   // console.log(this.result)
  // }
  ngOnInit() { }
  isEmpty(event, index) {
    this.sections[index]['isEmpty'] = event;
  }
  ngOnDestroy() {
    this._unsubscribe.unsubscribe();
  }

}
