import { GlobalConfigService } from './../../providers/global-config.service';
import { UserManagementService } from './../../providers/user-management.service';
import { RouterHelperService } from './../../providers/router-helper.service';
import { Subscription } from 'rxjs';
import { GlobalSearchService } from './../../providers/global-search.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private _unsubscribe = new Subscription();
  isDash: boolean;
  constructor(private navCtrl: NavController,
    private globalSearchSrvc: GlobalSearchService,
    public routerHlprSrvc: RouterHelperService,
    private router: Router,
    private globalConfigSrvc: GlobalConfigService,
    private userMgmtSrvc: UserManagementService) {
    this._unsubscribe.add(this.routerHlprSrvc.currentUrlSub.subscribe(res => {
      this.isDash = res ? res.indexOf('categories') > -1 || res == '/' : true
    }));
  }

  ngOnInit() {
    //init user data so that properties options work
    this.userMgmtSrvc.initUserSettings()
    let userData = this.userMgmtSrvc.user.getValue();
    if (!userData || !userData['myRoles'] || userData['myRoles'] == 0) {
      let userObj: any = {};
      userObj["myRoles"] = [1, 4]
      try {
        userObj["device_id"] = this.globalConfigSrvc.deviceInfo.uuid
        userObj["isLoggedIn"] = false;
        this.userMgmtSrvc.updateUser(userObj)
      }
      catch (err) {
        this.globalConfigSrvc.getDeviceInfo().then(() => {
          userObj["device_id"] = this.globalConfigSrvc.deviceInfo.uuid
          userObj["isLoggedIn"] = false;
          this.userMgmtSrvc.updateUser(userObj)
        })
      }
    }
  }

  searchFocus() {
    this.globalSearchSrvc.origin = this.router.url;
    this.navCtrl.navigateForward('/dashboard/search')
  }
  searchInput(event) {
    if (event.srcElement.value) {
      this.globalSearchSrvc.searchInput.next(event.srcElement.value)
    }
    else {
      this.globalSearchSrvc.searchInput.next(null)
      this.globalSearchSrvc.searchResult.next(null)
    }
  }
  ngOnDestroy() {
    this._unsubscribe.unsubscribe();
  }
}
