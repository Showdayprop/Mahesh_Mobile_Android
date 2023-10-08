import { GlobalConfigService } from './global-config.service';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  public user = new BehaviorSubject({});
  public userSettings = new BehaviorSubject({});
  public userFilters = new BehaviorSubject({});
  public isOnlyRentProperties = new BehaviorSubject(false);
  nearMeRadiusUpdated = false;
  public isLoggedIn = false;
  constructor(private storageSrvc: StorageService, public http: HttpClient,
    private globalConfigSrvc: GlobalConfigService) {
    this.storageSrvc.getObject('userInfo').then(data => {
      let d = data;
      if (!d) {
        d = []
        this.storageSrvc.setObject('userInfo', d)
      }
      else {
        if (d.myRoles && d.myRoles.length == 1 && d.myRoles[0] == '4') {
          //it is a tenant only
          this.isOnlyRentProperties.next(true);
        }
      }
      if (d.authToken) {
        this.globalConfigSrvc.authToken = d.authToken;
      }
      this.isLoggedIn = !d.isLoggedIn ? false : true;
      this.user.next(d)
    })
    this.initUserSettings();
    this.storageSrvc.getObject('userFilters').then(data => {
      let d = data;
      if (!d) {
        d = []
        this.storageSrvc.setObject('userFilters', d)
      }
      this.userFilters.next(d)
    })
  }

  updateUser(userObj) {
    this.storageSrvc.setObject('userInfo', userObj)
    this.isLoggedIn = cloneDeep(userObj.isLoggedIn);
    this.user.next(userObj)
    this.isOnlyRentProperties.next((userObj && userObj.myRoles && userObj.myRoles.length == 1 && userObj.myRoles[0] == '4'))
  }

  updateUserSettings(userSettingsObj) {
    this.userSettings.next(cloneDeep(userSettingsObj))
    this.storageSrvc.setObject('userSettings', userSettingsObj)
  }

  updateUserFilters(userFiltersObj) {
    if (userFiltersObj) {
      this.storageSrvc.setObject('userFilters', userFiltersObj)
    }
    else {
      this.storageSrvc.removeItem('userFilters')
    }
    this.userFilters.next(userFiltersObj)
  }

  initUserSettings() {
    this.storageSrvc.getObject('userSettings').then(data => {
      let d = data;
      if (!d) {
        d = {
          'nearMeToggle': false,
          'nearMeRadius': 10,
          'filtersActive': false
        }
        this.storageSrvc.setObject('userSettings', d)
      }
      this.userSettings.next(d)
    })
  }

  removeUserDataOnLogout() {
    this.user.next(null)
    this.userSettings.next(null)
    this.userFilters.next(null)
    this.storageSrvc.removeItem('userInfo')
    this.storageSrvc.removeItem('userSettings')
    this.storageSrvc.removeItem('userFilters')
  }

  checkForIsActive() {
    return this.http.get(environment.config.apiEndPoint + 'AuthRequests/check_is_active')
  }

}
