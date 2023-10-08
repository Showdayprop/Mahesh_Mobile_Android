import { ImageUploadComponent } from './../../../components/image-upload/image-upload.component';
import { Common } from './../../../shared/common';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from './../../../providers/utilities.service';
import { UserManagementService } from './../../../providers/user-management.service';
import { AlertController, NavController, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DirectoryService } from './../../../providers/directory.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss'],
})
export class ServiceComponent implements OnInit {
  @ViewChild('imagefile', { static: true }) imagefile: ElementRef<HTMLInputElement>;
  categories: any;
  customPopoverOptions: any = {
    header: 'Categories'
  };
  subCatFiltered: any;
  serviceForm: FormGroup;
  file: any;
  userData;
  selectedAreas: any;
  selectedEstates: any;
  locations: any[];
  locationsSubscription: Subscription;
  editServiceData;
  catSelectedText;
  subCatSelectedText;
  coords;
  serviceImages = [];

  constructor(public directorySrvc: DirectoryService,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private userMgmtSrvc: UserManagementService,
    private utilitiesSrvc: UtilityService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private common: Common,
    private modalCtrl: ModalController) {
    delete this.directorySrvc.serviceCoordinates;
    this.editServiceData = this.activatedRoute.snapshot.data['data'];
    this.userData = this.userMgmtSrvc.user.getValue();
    this.categories = this.directorySrvc.directoryCategories.getValue().filter(el => (el.service_type_slug != 'for-sale' && el.service_type_slug != 'on-show' && el.service_type_slug != 'for-rent'));

  }

  ngOnInit() {
    this.serviceForm = this.formBuilder.group({
      cat: [null, Validators.compose([
        Validators.required
      ])],
      service_category_id: [{ value: null, disabled: true }, Validators.compose([
        Validators.required
      ])],
      service_name: [null, Validators.compose([
        Validators.required
      ])],
      service_long_desc: [null],
      service_terms_conditions: [null],
      service_price: [null]
    });
    if (this.editServiceData) {
      this.serviceForm.controls.cat.setValue(this.editServiceData['cat']);
      this.serviceForm.controls.service_category_id.setValue(this.editServiceData['service_category_id']);
      this.serviceForm.controls.service_category_id.enable();
      this.serviceForm.controls.service_name.setValue(this.editServiceData['service_name']);
      this.serviceForm.controls.service_long_desc.setValue(this.editServiceData['service_long_desc']);
      this.serviceForm.controls.service_terms_conditions.setValue(this.editServiceData['service_terms_conditions']);
      this.serviceForm.controls.service_price.setValue(this.editServiceData['service_price']);
      if (this.editServiceData['lat'] && this.editServiceData['long']) {
        this.coords = {
          lat: this.editServiceData['lat'],
          long: this.editServiceData['long']
        };
        this.directorySrvc.serviceCoordinates = this.coords
      }
      this.selectedAreas = this.editServiceData['areas'];
      this.selectedEstates = this.editServiceData['estates'];
      let catDetail = this.categories.find(el => el.service_id == this.editServiceData['cat'])
      this.catSelectedText = catDetail['service_type']
      this.subCatFiltered = catDetail['subcategories'];
      if (catDetail['subcategories'] && catDetail['subcategories'].length > 0) {
        let subCatDetail = catDetail['subcategories'].find(el => el.service_id == this.editServiceData['service_category_id'])
        if (subCatDetail && subCatDetail['service_type']) {
          this.subCatSelectedText = subCatDetail['service_type']
        }
      }
      if (this.editServiceData.images && this.editServiceData.images.length > 0) {
        this.serviceImages = this.editServiceData.images;
      }
    }
  }

  ionViewWillEnter() {
    if (this.directorySrvc.serviceCoordinates) {
      this.coords = this.directorySrvc.serviceCoordinates
    }
    else {
      delete this.coords
    }
  }

  categorySelected(event) {
    this.subCatFiltered = this.categories.find(el => el.service_id == event.detail.value).subcategories
    this.serviceForm.controls.service_category_id.setValue(null)
    if (this.subCatFiltered.length != 0) {
      this.serviceForm.controls.service_category_id.enable();
    }
  }
  async requestSubCat() {
    const alert = await this.alertCtrl.create({
      header: 'Request for new Sub Category',
      message: 'Enter the required Sub Category name.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Enter here'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Submit',
          handler: ({ name }) => {
            if (name) {
              this.directorySrvc.requestNewSubCat(name).toPromise().then(res => {
                this.common.presentToast('Your request has been sent to the admin. Please contact us shortly.')
              })
            }
            console.log(name);
          }
        }
      ]
    })
    await alert.present();
  }

  onFileChange(fileChangeEvent) {
    this.file = fileChangeEvent.target.files[0];
  }
  removeImg() {
    // if (this.editServiceData && this.editServiceData.id && this.editServiceData.default_pic) {
    //   delete this.editServiceData.default_pic
    //   this.directorySrvc.removeServiceImage({ id: this.editServiceData.id }).toPromise().then(res => {
    //     console.log('Image removed')
    //   }).catch(err => console.log(err))
    // }
    if (this.file) {
      delete this.file
      this.imagefile.nativeElement.value = "";
    }
  }
  save() {
    if (this.serviceForm.invalid) {
      this.common.presentToast('Incomplete Form. Please fill in the required fields')
      return;
    }
    this.common.presentLoader();
    const form = new FormData();
    Object.keys(this.serviceForm.value).forEach(el => {
      if (this.serviceForm.value[el]) {
        form.append(el, this.serviceForm.value[el]);
      }
      else {
        form.append(el, "");
      }
    })
    if (this.file && this.file.name) form.append('photo', this.file, this.file.name);
    let is_active = false;
    // form.append('affiliate_id', this.userData.id);
    if (this.coords) {
      form.append('lat', this.coords.lat)
      form.append('long', this.coords.long)
      is_active = true;
    }
    if (this.selectedAreas && this.selectedAreas.length > 0) {
      is_active = true;
      form.append('areas', JSON.stringify(this.selectedAreas.map(el => el.area_id)))
    }

    if (this.selectedEstates && this.selectedEstates.length > 0) {
      is_active = true;
      form.append('estates', JSON.stringify(this.selectedEstates.map(el => el.community_id)))
    }

    if (this.editServiceData && this.editServiceData.id) form.append('id', this.editServiceData.id)

    form.append('is_active', is_active ? '1' : '0')
    this.directorySrvc.createService(form).toPromise().then(res => {
      console.log(res)
      this.directorySrvc.doServiceListRefresh = true;
      this.common.presentToast(this.editServiceData ? 'Changes have been updated.' : 'New service has been created.')
      if (this.editServiceData) {
        this.common.presentAlertForConfirmation('Do you want to update service images?', 'Confirm', 'Yes').then(r => {
          this.uploadImages(res)
        }).catch(c => {
          this.navCtrl.navigateRoot('/affiliate-provider')
        })
      }
      else {
        this.uploadImages(res)
      }
    }).catch(err => {
      this.common.presentToast('Unable to save service.')
      console.log(err)
    }).finally(() => this.common.dismissLoader())
  }

  searchChange(event: {
    component: IonicSelectableComponent,
    text: string
  }, isEstate) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.locationsSubscription) {
      this.locationsSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.locationsSubscription) {
        this.locationsSubscription.unsubscribe();
      }

      event.component.items = [];
      event.component.endSearch();
      return;
    }

    this.locationsSubscription = this.utilitiesSrvc.searchAreas(text, 'za', isEstate ? isEstate : null).subscribe((locations: any) => {
      // Subscription will be closed when unsubscribed manually.
      if (this.locationsSubscription.closed) {
        return;
      }
      event.component.items = isEstate ? locations['estates'] : locations;
      event.component.endSearch();
    });
  }

  captureCoordinates() {
    // console.log("Coordinates capture")
    this.navCtrl.navigateForward(['../upload-coordinates'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: 'service'
      }
    })
  }

  checkForMaxCount(event: {
    component: IonicSelectableComponent,
    value: any
  }, type) {
    if (event.value.length > 3) {
      this.common.presentToast('You can only select 3 ' + type)
      type == 'areas' ? this.selectedAreas = [] : this.selectedEstates = []
    }
  }

  uploadImages(data) {
    this.navCtrl.navigateForward(['../upload-images'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        service_id: data['service_id']
      }
    })
  }
  async selectImages() {
    // images are there so take the user to the list of images
    const modal = await this.modalCtrl.create({
      component: ImageUploadComponent,
      componentProps: {
        images: this.serviceImages,
        id: this.editServiceData && this.editServiceData.id ? this.editServiceData.id : null,
        affiliate_id: this.userData.id
      }
    });
    return await modal.present();
  }
}
