import { UserManagementService } from './../../providers/user-management.service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PickerController } from '@ionic/angular';
import { ThemePalette } from '@angular/material/core';
import { ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UtilityService } from '../../providers/utilities.service';
import { AuthenticationService } from '../../providers/authentication.service';

const { Storage } = Plugins;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  myProfile: any;
  userData: any;
  userRoles: any = [];
  isLoaded = false;
  alertsForNumDays = 7;
  disableCancel = false;
  slideColor: ThemePalette = 'warn';

  settingForm = new FormGroup({
    enableNotifications: new FormControl(''),
    myRole: new FormControl('', Validators.required),
    alertsDuration: new FormControl(5, Validators.required)
  });

  nearMeRadius:number;
  nearMeRadiusOptions=[];
  // featuredToggle:boolean;
  userSettings:any;

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private utilityService: UtilityService,
    private authService: AuthenticationService,
    private pickerCtrlr:PickerController,
    private userMgmtSrvc:UserManagementService
  ) {
    for (let index = 1; index <= 10; index++) {
      this.nearMeRadiusOptions.push({text:index,value:index})      
    }
  }
  ngOnInit(){
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
    // this.featuredToggle = this.userSettings && this.userSettings.featuredToggle!=undefined ? this.userSettings.featuredToggle : true;
    this.nearMeRadius = this.userSettings && this.userSettings.nearMeRadius ? this.userSettings.nearMeRadius : 10;
  }
  // async ngOnInit() {
  //   const loader = await this.loadingCtrl.create();

  //   this.userData = this.authService.getUserData();

  //   await this.utilityService.getFunctionalTypes().subscribe(async (response) => {
  //     this.isLoaded = true;
  //     this.userRoles = response;

  //     loader.dismiss();
  //   });

  //   const settingsData = await Storage.get({key: 'app_settings_' + this.userData.id});
  //   const appSettings = settingsData.value ? JSON.parse(settingsData.value) : {};

  //   this.settingForm.patchValue({
  //     enableNotifications: appSettings.enable_notification,
  //     myRole: appSettings.my_role,
  //     alertsDuration: appSettings.alerts_duration ? appSettings.alerts_duration : this.alertsForNumDays
  //   });

  //   if (!appSettings.my_role) {
  //     this.disableCancel = true;
  //   }
  // }

  // async save() {
  //   if (!this.settingForm.value.myRole.length) {
  //     const toast = await this.toastController.create({
  //       showCloseButton: true,
  //       message: 'Please configure your role.',
  //       duration: 5000,
  //       position: 'bottom',
  //       color: 'danger'
  //     });

  //     toast.present();
  //     return;
  //   }

  //   if (!this.settingForm.value.alertsDuration) {
  //     const toast = await this.toastController.create({
  //       showCloseButton: true,
  //       message: 'Please configure the alert duration.',
  //       duration: 5000,
  //       position: 'bottom',
  //       color: 'danger'
  //     });

  //     toast.present();
  //     return;
  //   }

  //   const settingObj = {
  //     enable_notification: this.settingForm.value.enableNotifications,
  //     my_role: this.settingForm.value.myRole,
  //     alerts_duration: this.settingForm.value.alertsDuration
  //   };

  //   /*
  //   this.push.hasPermission()
  //   .then((res: any) => {
  //     if (res.isEnabled) {
  //       console.log('We have permission to send push notifications');
  //     } else {
  //       console.log('We do not have permission to send push notifications');
  //     }
  //   });
  //   */
  //   await Storage.remove({
  //     key: 'app_settings_' + this.userData.id
  //   });

  //   await Storage.set({
  //     key: 'app_settings_' + this.userData.id,
  //     value: JSON.stringify(settingObj)
  //   }).then(async () => {
  //     const toast = await this.toastController.create({
  //       message: 'Your settings have been saved.',
  //       duration: 2000
  //     });
  //     toast.present();

  //     this.navCtrl.navigateBack('home');
  //   });
  // }

  // cancel() {
  //   this.navCtrl.navigateBack('home');
  // }

  // featureToggled(){
  //   if(this.userSettings && this.userSettings.featuredToggle){
  //     this.userSettings.featuredToggle = this.featuredToggle;
  //   }
  //   else{
  //     this.userSettings['featuredToggle'] = this.featuredToggle
  //   }
  //   this.userMgmtSrvc.updateUserSettings(this.userSettings)
  // }
  async openRadiusPicker(){
    this.nearMeRadiusOptions.forEach(data => { delete data.transform; delete data.duration; delete data.selected; }); 
    const picker = await this.pickerCtrlr.create({
      columns:[{
        name:'Radius',
        options:this.nearMeRadiusOptions
      }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            console.log(`Got Value ${value}`);
            this.nearMeRadius = value.Radius.text
            if(this.userSettings && this.userSettings.nearMeRadius){
              this.userSettings.nearMeRadius = value.Radius.text;
            }
            else{
              this.userSettings['nearMeRadius'] = value.Radius.text
            }
            this.userMgmtSrvc.nearMeRadiusUpdated = true;
            this.userMgmtSrvc.updateUserSettings(this.userSettings)
          }
        }
      ]
    })
    picker.present();
  }
}
