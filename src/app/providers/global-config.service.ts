import { AlertController } from '@ionic/angular';
import { UtilityService } from './utilities.service';
import { LoggerService } from './../core/logger.service';
import { NotificationService } from './notification.service';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { Plugins } from '@capacitor/core';
import { StorageService } from './storage.service';
import { Market } from '@ionic-native/market/ngx'
// import { Analytics } from 'capacitor-analytics';
// const analytics = new Analytics();
//import { Device } from '@ionic-native/device';
import { AppVersion } from '@ionic-native/app-version';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigService {

  public versionNumber: any;
  public deviceInfo: any;
  public authToken: any;
  public apiEndPoint = 'https://api.showday.com/index.php/';
  pushToken;
  preferencesInServerOnce;
  public showLogs = false;
  constructor(private storageSrvc: StorageService,
    private notificationSrvc: NotificationService,
    private logger: LoggerService) {
    this.apiEndPoint = environment.config.apiEndPoint;
    this.showLogs = environment.inDeviceLogging;
    this.getDeviceData();
    this.getDeviceInfo();
    this.getPreferencesInServerOnceFlag();
  }

  async getDeviceData() {
    AppVersion.getVersionNumber().then(
      (versionNumber) => {
        //console.log("versionNumber=>", versionNumber);
        this.versionNumber = versionNumber;
      },
      (error) => {
        console.log(error);
      });
  }

  async getDeviceInfo() {
    this.deviceInfo = await Device.getInfo();
    if(!this.deviceInfo.appVersion) {
      this.deviceInfo.appVersion = "4.1.7.1";//this.versionNumber;
    }
    this.storageSrvc.setObject('deviceInfo', this.deviceInfo);
    // analytics.setUserID({value:this.deviceInfo.uuid.toString()})
    //We cannot and should not send the device name to analytics, it breaches user privacy
    // if(this.deviceInfo.name){
    //   analytics.setUserProp({ key: "name", value: this.deviceInfo.name })
    // }
    // else{
    //   analytics.setUserProp({ key: "platform", value: this.deviceInfo.platform })
    // }
  }

  async getPreferencesInServerOnceFlag() {
    this.preferencesInServerOnce = await this.storageSrvc.getObject('preferencesInServerOnce');
    this.logger.error('GlobalConfigService : getPreferencesInServerOnceFlag : preferencesInServerOnce: ', this.preferencesInServerOnce)
  }
  setPreferencesInServerOnceFlag(value) {
    this.storageSrvc.setObject('preferencesInServerOnce', { value: value });
    this.preferencesInServerOnce = value;
  }

  async checkAndSetPushToken(token) {
    let exisitngToken = await this.storageSrvc.getItem('push_token');
    if (!exisitngToken || exisitngToken != token) {
      this.notificationSrvc.setPushToken({ "push_token": token }).toPromise().then(res => {
        this.storageSrvc.setItem('push_token', token);
        this.logger.log('GlobalConfigService : setPushToken to server :', token)
      }).catch(err => {
        this.logger.error('GlobalConfigService : setPushToken to server failed:', err)
      })
    }
    else if (exisitngToken == token) {
      //do nothing, already saved to server.
    }
    this.pushToken = token;
  }
}
