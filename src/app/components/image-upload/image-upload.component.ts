import { Common } from './../../shared/common';
import { LoggerService } from './../../core/logger.service';
import { ActivatedRoute } from '@angular/router';
import { DirectoryService } from './../../providers/directory.service';
import { FileService } from './../../providers/file.service';
import { NavController } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent implements OnInit {
  images = [];
  service_id;
  popoverOptions = {
    cssClass: 'display-order-popover'
  }
  oldDisOrder: any;
  constructor(private imagePicker: ImagePicker,
    private navCtrl: NavController,
    private fileSrvc: FileService,
    private activatedRoute: ActivatedRoute,
    private directorySrvc: DirectoryService,
    private logger: LoggerService,
    private common: Common) {
    this.service_id = this.activatedRoute.snapshot.queryParams.service_id;
    this.directorySrvc.getServiceImages({ id: this.service_id }).toPromise().then((res: any) => {
      this.images = res;
    })
  }

  ngOnInit() { }

  async initPhotoPlugin() {
    const hasPermission = await this.imagePicker.hasReadPermission();
    if (!hasPermission) {
      this.imagePicker.requestReadPermission().then(res => {
        console.log(res)
      });
    }
  }

  addImages() {
    this.imagePicker.getPictures({
      maximumImagesCount: 10 - this.images.length,
      outputType: 1
    }).then(async (results) => {
      for (let index = 0; index < results.length; index++) {
        let img = {
          'base64': "data:image/jpeg;base64," + results[index],
          'dis_order': this.images.length + 1
        }
        let writeRes = await this.fileSrvc.writeFile('file_' + img['dis_order'], img['base64'])
        if (writeRes && writeRes.uri) img['uri'] = writeRes.uri
        else continue;
        this.images.push(img)
      }
    }, (err) => { });
  }
  saveUploadRecursive() {
    if (this.images.length > 0) {
      let imageSyncCount = 0;
      let exisitngImages = [];
      this.setLoadingText(`Syncing ${imageSyncCount}/${this.images.length}`);
      this.common.presentLoader();
      this.images.forEach((img, indx) => {
        // check if image is existing or new
        if (img.img_id) {
          // if existing, push to a new array so that we can update them with one request
          exisitngImages.push(img)
          imageSyncCount++;
          this.setLoadingText(`Syncing ${imageSyncCount}/${this.images.length}`);
        } else if (img.uri) {
          this.fileSrvc.uploadPhotoWithProgress(img.uri, 'file_' + indx, 'Affiliates/upload_service_image', {
            title: img.title,
            desc: img.desc,
            dis_order: img.dis_order,
            service_id: this.service_id,
            file_type: 'jpg'
          }).then(res => {
            console.log("Image " + indx + " uploaded" + JSON.stringify(res))
            imageSyncCount++
            this.setLoadingText(`Syncing ${imageSyncCount}/${this.images.length}`);
            this.fileSrvc.deleteFile(img.uri);
            if (imageSyncCount == this.images.length) {
              this.common.dismissAllLoaders();
              this.common.presentToast('Images have been synced with server')
              this.navCtrl.navigateRoot('/affiliate-provider');
            }
          }).catch(err => {
            console.log(err)
            this.common.dismissAllLoaders();
          })
        }
        else {
          this.logger.log('ImageUploadComponent :: saveUploadRecursive :: image has no id or uri : ', img)
        }
      });
      if (exisitngImages.length > 0) {
        this.directorySrvc.updateServiceImages(exisitngImages).toPromise().then(res => {
          if (imageSyncCount == this.images.length) {
            this.common.dismissAllLoaders();
            this.common.presentToast('Images have been synced with server')
            this.navCtrl.navigateRoot('/affiliate-provider')
          }
        }).catch(err => {
          console.log(err)
          this.common.dismissAllLoaders();
        })
      }
    }
    else {
      this.navCtrl.navigateRoot('/affiliate-provider');
    }
  }
  /* saveUploadMultiple() {
    if (this.images.length > 0) {
      let formData = new FormData();
      formData.append('service_id', this.service_id);
      let newImageInfo = [];
      let oldImageInfo = [];
      this.images.forEach((el, i) => {
        if (el['base64'] && el['uri']) {
          let blob = this.fileSrvc.convertFileToBlob(el['base64'].split(',')[1], el['uri'].substr(el['uri'].lastIndexOf('.') + 1, el['uri'].length))
          formData.append('img_' + i, blob)
          newImageInfo.push({
            title: el.title,
            desc: el.desc,
            dis_order: el.dis_order
          })
        }
        else {
          oldImageInfo.push(el)
        }
      })
      formData.append('new_images', JSON.stringify(newImageInfo));
      formData.append('old_images', JSON.stringify(oldImageInfo));
      this.directorySrvc.uploadImages(formData).toPromise().then(res => {
        console.log(res)
      })
    }
  } */
  disOrderChange(item, indx) {
    if (!this.oldDisOrder) return;
    let alternateEl = this.images.find((el, i) => (el.dis_order == item.dis_order && i != indx))
    if (!alternateEl) return;
    alternateEl['dis_order'] = this.oldDisOrder;
    delete this.oldDisOrder;
  }
  disOrderBlur(item) {
    this.oldDisOrder = item.dis_order;
  }
  setLoadingText(text: string) {
    const elem = document.querySelector("div.loading-wrapper div.loading-content");
    if (elem) elem.innerHTML = `Please Wait : <strong>${text}</strong>`;
  }
  deleteImage(item, indx) {
    this.common.presentAlertForConfirmation('Are you sure you want to delete the image?').then(res => {
      this.directorySrvc.deleteImage({ image_id: item.img_id, service_id: this.service_id }).toPromise().then(res => {
        this.common.presentToast('Image has been removed')
        this.images.splice(indx, 1)
      })
    })
  }
}
