import { PhotosPermissionComponent } from './../../components/photos-permission/photos-permission.component';
import { Common } from './../../shared/common';
import { UserManagementService } from './../../providers/user-management.service';
import { DirectoryService } from './../../providers/directory.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { PermissionType, Plugins } from '@capacitor/core';
const {Permissions}= Plugins;
@Component({
  selector: 'app-affiliate-provider',
  templateUrl: './affiliate-provider.page.html',
  styleUrls: ['./affiliate-provider.page.scss'],
})
export class AffiliateProviderPage implements OnInit {
  userData;
  userServices;
  loading: boolean = false;
  constructor(private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private directorySrvc: DirectoryService,
    private userMgmtSrvc: UserManagementService,
    private imagePicker: ImagePicker,
    private common: Common,
    private modalCtrlr: ModalController) {
    this.userData = this.userMgmtSrvc.user.getValue();
    this.fetchServices(true);
    this.initPhotoPlugin();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.directorySrvc.doServiceListRefresh) {
      this.fetchServices(true)
    }
  }
  async initPhotoPlugin() {
    // const hasPermission = await this.imagePicker.hasReadPermission();
    const hasPermission = await Permissions.query({ name: PermissionType.Photos });
    console.log(hasPermission)
    if (hasPermission.state=='prompt') {
      // present the screen image first
      const permissionModal = await this.modalCtrlr.create({
        component: PhotosPermissionComponent,
        cssClass: 'medium-modal-css'
      })
      permissionModal.onDidDismiss().then(d => {
        console.log(d)
        this.imagePicker.requestReadPermission().then(res => {
          console.log(res)
        });
      })
      await permissionModal.present();
    }
  }
  addService() {
    if (this.userServices && this.userServices.length >= 2) {
      this.common.presentPopupAlertForOK('You are allowed to create maximum 2 services. Please contact us for further support.', 'Alert')
      return;
    }
    delete this.directorySrvc.doServiceListRefresh;
    this.navCtrl.navigateForward(['./service'], { relativeTo: this.activatedRoute })
  }

  async fetchServices(isRefresh: boolean, event?) {
    // await this.common.presentLoader();
    this.loading = true;
    this.directorySrvc.getServicesForProvider().toPromise().then(data => {
      if (data && data['services']) {
        if (isRefresh) {
          this.userServices = data['services'];
        }
        else {
          this.userServices = [...this.userServices, ...data['services']]
        }
      }
      if (event) event.target.complete();
    }).catch(err => console.log(err)).finally(() => {
      // this.common.dismissLoader()
      this.loading = false;
    }
    )
  }

  delete(item, indx) {
    this.common.presentAlertForConfirmation('Are you sure you want to delete this service?', 'Confirm', 'Yes').then(() => {
      this.common.presentLoader();
      this.directorySrvc.deleteService({ service_id: item.service_id }).toPromise().then(res => {
        if (res) {
          this.userServices.splice(indx, 1);
          this.common.presentToast('Service has been removed.')
        }
      }).catch(err => {
        if (err.statusText) {
          this.common.presentToast(err.statusText)
        }
      }).finally(() => this.common.dismissLoader())
    })
  }

  edit(item) {
    this.navCtrl.navigateForward(['./service'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: item.service_id
      }
    })
  }

}
