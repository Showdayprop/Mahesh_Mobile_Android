import { LoggerService } from './../../../core/logger.service';
import { Common } from './../../../shared/common';
import { UtilityService } from './../../../providers/utilities.service';
import { ImageurlPipe } from './../../../pipes/imageurl.pipe';
import { TrackerService } from './../../../providers/tracker.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ImageGalleryComponent } from '../../../components/image-gallery/image-gallery.component';
import cloneDeep from 'lodash.clonedeep';
import { CameraHelperService } from '../../../providers/camera-helper.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  detail;
  images = [];
  isLoading = false;
  type
  constructor(private trackerSrvc: TrackerService,
    private cameraHlprSrvc:CameraHelperService,
    private domSanitizer: DomSanitizer,
    private modalCtrl: ModalController,
    private imageUrlPipe: ImageurlPipe,
    private utilitySrvc: UtilityService,
    private common: Common,
    private logger: LoggerService,
    private activatedRoute:ActivatedRoute
  ) {
    this.type = this.activatedRoute.snapshot.queryParams.type;
    this.detail = cloneDeep(this.trackerSrvc.detailObj$.getValue());
    if (this.detail) {
      if (this.detail.id) {
        this.isLoading = true;
        this.trackerSrvc.getImages({ id: this.detail.id }).toPromise().then((res:any) => {
          this.images = res
        }).finally(() => {
          this.isLoading = false
          this.common.dismissAllLoaders()
        })
      }
      if (this.detail['area']) this.detail['area'] = JSON.parse(this.detail['area'])
      if (this.detail['initial_price'] && this.detail['lowest_price']) this.detail['diff'] = this.detail['initial_price'] - this.detail['lowest_price']
      if (this.detail['sold'] == 1 && this.detail['sold_on']) {
        // let list_d = new Date(this.detail['listed_on'])
        // let sold_d = new Date(this.detail['sold_on'])
        this.detail['days_diff'] = Math.round((Number(new Date(this.detail['sold_on'])) - Number(new Date(this.detail['listed_on'])))/ (1000 * 60 * 60 * 24))
      }
      else {
        this.detail['days_diff'] = Math.round((Number(new Date()) - Number(new Date(this.detail['listed_on'])))/ (1000 * 60 * 60 * 24))
      }
      if (this.detail['sqm_undercover'] && this.detail['initial_price']) {
        this.detail['per_sqm'] = Number(this.detail['initial_price']) / Number(this.detail['sqm_undercover'])
      }
    }
  }

  ngOnInit() {}

  async openImageGallery(index?) {
    let imgs = this.images.map(el=>{
      if (el.image && el.image_path) return this.imageUrlPipe.transform(el.image_path + el.image)
      else if(el.src) return el.src
    })
    const modal = await this.modalCtrl.create({
      component: ImageGalleryComponent,
      componentProps: {
        images: imgs,
        currentIndex: index
      }
    });
    return await modal.present();
  }

  addImage() {
    this.cameraHlprSrvc.capturePhotoURI().then(image=>{
      // this.myPond.addFile(image.webPath);
      let img = {
        src:this.domSanitizer.bypassSecurityTrustResourceUrl(image && (image.webPath)),
        path:image.path,
        status:0
      }
      this.isLoading = true;
      this.trackerSrvc.uploadPhoto('image_' + this.images.length, image.path, this.detail.id).then(res => {
        console.log(res)
        if (res && res['responseCode'] && res['response'] && !isNaN(res['response'])) {
          img['id'] = res['response']
          this.images.unshift(img)
        }
      }).catch(er => {
        console.log(er)
      }).finally(() => {
        this.isLoading = false;
      })
    }).catch(err=>{
      console.log(err)
    })
  }
  remove(img, i) {
    if (img.id) {
      this.trackerSrvc.deleteImage({ ...img }).toPromise().then(res => {
        if (res) {
          this.images.splice(i,1)
        }
      })
    }
    else { 
      this.images.splice(i,1)
    }
  }

  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkCommon('tracker', this.detail.id)
    if (url) {
      this.logger.log('TrackerDetailPage : share : deeplinked share url', url);
      this.common.dismissLoader();
      await Plugins.Share.share({
        title: "Tracker for the property",
        text: "Click here to track property price and days on market",
        url: url.toString(),
        dialogTitle: 'Share Tracker Set'
      });
    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }

  ngOnDestroy(): void {
    this.trackerSrvc.detailObj$.next({});
  }
}
