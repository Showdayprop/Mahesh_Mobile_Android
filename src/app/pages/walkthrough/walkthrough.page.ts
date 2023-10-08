import { UserManagementService } from './../../providers/user-management.service';
import { Common } from './../../shared/common';
import { GlobalConfigService } from './../../providers/global-config.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, MenuController } from '@ionic/angular';
import { AuthenticationService } from '../../providers/authentication.service';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.page.html',
  styleUrls: ['./walkthrough.page.scss'],
})

export class WalkthroughPage implements OnInit {
  myRoles = [];
  isSeller: boolean = false;
  userData;
  userSettings;
  public version;
  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public router: Router,
    private authService: AuthenticationService,
    private userMgmtSrvc: UserManagementService,
    private globalConfigSrvc: GlobalConfigService,
    private common: Common
  ) {
    this.userData = this.userMgmtSrvc.user.getValue();
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
    this.version = this.globalConfigSrvc.deviceInfo.appVersion;
  }

  ngOnInit() {
    // const authToken = await Storage.get({key: 'sd_token'});

    if (this.userData && this.userData.authToken) {
      this.common.presentLoader();
      this.globalConfigSrvc.authToken = this.userData.authToken;
      this.authService.getMe().toPromise().then(async me => {
        // const appSettings = await Storage.get({key: 'app_settings_' + me.id});
        // const tempAppSettings = appSettings.value ? JSON.parse(appSettings.value) : {};

        if (this.userData.myRoles) {
          this.userMgmtSrvc.initUserSettings()
          this.navCtrl.navigateRoot('/home')
        } else {
          //This condition should not occur, check if this console log appears
          console.log('Error :: User role not found in user data object')
        }
      }).catch((err) => {
        console.log(err)
        this.common.presentToast(err)
      }).finally(() => {
        this.common.dismissLoader()
      });
    }
    else if (this.userData && this.userData.myRoles && this.userData.myRoles.length > 0) {
      if (!this.userSettings || this.userSettings.length == 0 || (Object.keys(this.userSettings).length === 0 && this.userSettings.constructor === Object)) {
        this.userMgmtSrvc.initUserSettings()
      }
      this.navCtrl.navigateRoot('/home')
    }
  }

  roleOptionChecked(event) {
    if (event.target.checked) {
      if (event.target.value == "sell") {
        this.isSeller = true;
        this.myRoles.push('2');
        this.myRoles.push('3')
        this.myRoles.push('5')
      }
      else {
        this.myRoles.push(event.target.value)
      }
    }
    else {
      if (event.target.value == "sell") {
        this.isSeller = false;
        this.myRoles = this.myRoles.filter(el => el != "2" && el != "3" && el != "5")
      }
      else {
        this.myRoles = this.myRoles.filter(el => el != event.target.value)
      }
    }
  }

  showMe() {
    //skip login and move to dashboard
    let userObj: any = {};
    userObj["myRoles"] = this.myRoles

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
    finally {
      if (this.isSeller) {
        this.navCtrl.navigateForward('/login');
      }
      else {
        this.userMgmtSrvc.initUserSettings()
        this.navCtrl.navigateRoot('/home')
      }
    }

    // if(!(this.globalConfigSrvc.deviceInfo && this.globalConfigSrvc.deviceInfo.uuid)){
    //   //device id not found
    //   this.globalConfigSrvc.getDeviceInfo().then(()=>{
    //     userObj["device_id"]=this.globalConfigSrvc.deviceInfo.uuid
    //     this.userMgmtSrvc.updateUser(userObj)
    //   })
    // }
    // else{
    //   userObj["device_id"]=this.globalConfigSrvc.deviceInfo.uuid
    //   this.userMgmtSrvc.updateUser(userObj)
    // }

    // this.navCtrl.navigateRoot('/home').then(() => {
    //   // this.events.publish('auth_info', me);
    // });
  }

  openLoginPage() {
    this.navCtrl.navigateForward('/login');
  }
}
