import { UtilityService } from './../../providers/utilities.service';
import { AlertController, NavController, IonInfiniteScroll, MenuController, PopoverController } from '@ionic/angular';
import { UserManagementService } from './../../providers/user-management.service';
import { Common } from './../../shared/common';
import { PropertiesService } from './../../providers/properties.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FileService } from '../../providers/file.service';
import { CameraHelperService } from '../../providers/camera-helper.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { SearchPopoverListComponent } from '../../components/search-popover-list/search-popover-list.component';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.page.html',
  styleUrls: ['./seller.page.scss'],
})
export class SellerPage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;
  properties: any = [];
  userSettings;
  listingsOffset = 0;
  popoverFlag: boolean = false;
  searchText;
  propertiesCount: any;
  constructor(public propertiesSrvc: PropertiesService,
    private common: Common,
    private userMgmtSrvc: UserManagementService,
    public navCtrl: NavController,
    private fileSrvc: FileService,
    private cameraHlprSrvc: CameraHelperService,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private utilityService: UtilityService,
    private popoverCtrl: PopoverController) {
    this.userSettings = this.userMgmtSrvc.userSettings.getValue();
    this.utilityService.getMandateTypes();
  }

  ngOnInit() {
    this.updatePropertiesCount();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true)
    this.propertiesSrvc.newProperty.next(null)
  }

  async createNew() {
    const alert = await this.alertCtrl.create({
      header: "Type",
      message: "Select the type of Showday you want to create",
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'External URL',
          value: 'url',
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Create New',
          value: 'new'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.menuCtrl.enable(false)
            if (data == "url") {
              //user has selected url option
              this.navCtrl.navigateForward('seller/add-url');
            }
            else if (data == 'new') {
              this.navCtrl.navigateForward('seller/detailed-listing');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  test() {
    // this.cameraHlprSrvc.capturePhotoURI().then(image=>{
    this.fileSrvc.uploadPhoto('image_' + 1 + '.jpg', "file:///data/user/0/com.properties.showday/cache/JPEG_20200609_135931_3283215786403785577.jpg", 2351, 1).then(res => {
      console.log(res);
      if (res) {
        this.common.presentToast('s')
      }
      else {
        this.common.presentToast('Server error. Please try again later or contact support.!')
      }
    }).catch(err => {
      console.log(err)
      this.common.presentToast('Unable connect to server. Please try again later or contact support.!')
    })
    // }).catch(err=>{
    //   console.log(err)
    // })
  }

  onSearchChange(event) {
    if (event.target.value) {
      this.utilityService.searchAreas(event.srcElement.value, 'za').toPromise().then(res => {
        this.utilityService.areaSearchResults.next(res)
        // delete this.selectedArea
        this.popoverCtrl.dismiss()
        this.popoverFlag = false;
        // if(this.popoverFlag){
        // }
        setTimeout(() => {
          this.presentPopover(event)
        }, 200);
      })
    }
  }
  async presentPopover(ev) {
    const searchPopover = await this.popoverCtrl.create({
      component: SearchPopoverListComponent,
      event: ev,
      translucent: true,
      keyboardClose: false,
      mode: "ios",
      showBackdrop: true,
      backdropDismiss: true,
    })
    this.popoverFlag = true;
    await searchPopover.present();
    const { data } = await searchPopover.onDidDismiss()
    if (data) {
      // if(this.selectedAreas.filter(el=>el.area_id ==data.area_id).length==0){
      //   this.selectedAreas.push(data);
      // }
      // else{
      //   this.common.presentToast('Area has been selected already.!')
      // }
      // this.searchResult = ''
    }
    this.popoverFlag = false;
  }

  search() {
    this.propertiesSrvc.searchKey.next(this.searchText);
    this.updatePropertiesCount();
  }
  clearSearch() {
    this.propertiesSrvc.searchKey.next(null);
    delete this.searchText;
    this.updatePropertiesCount();
  }
  updatePropertiesCount() {
    let params = {};
    if (this.searchText) {
      params['searchKey'] = this.searchText;
    }
    this.propertiesSrvc.getPropertyListingsByMeCount(params).toPromise().then(res => {
      this.propertiesCount = res;
    })
  }
}
