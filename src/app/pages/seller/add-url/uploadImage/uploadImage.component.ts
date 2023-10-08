import { environment } from './../../../../../environments/environment';
import { PropertiesService } from './../../../../providers/properties.service';
import { Common } from '../../../../shared/common';
import { CameraHelperService } from '../../../../providers/camera-helper.service';
import { FileService } from '../../../../providers/file.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-image',
  templateUrl: './uploadImage.component.html',
  styleUrls: ['./uploadImage.component.scss'],
})
export class UploadImageComponent implements OnInit {
  imgSrc;
  property;
  image;
  constructor(
    private navCtrl:NavController,
    private activatedRoute:ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private fileSrvc: FileService,
    private cameraHlprSrvc:CameraHelperService,
    private common:Common,
    private propertiesSrvc:PropertiesService) { 
    this.property = this.propertiesSrvc.newProperty.getValue();
    if(this.property && this.property.default_pic && this.property.id){
      this.imgSrc = environment.config.storagePath + this.property.id +'/'+ this.property.default_pic;
      this.image = this.property.default_pic;
    }
  }

  ngOnInit() {}

  ionViewWillEnter(){
    this.property = this.propertiesSrvc.newProperty.getValue();
  }
  
  takePicture() {
    this.cameraHlprSrvc.capturePhotoURI().then(image=>{
      this.imgSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(image && (image.webPath));
      this.image = image
    }).catch(err=>{
      console.log(err)
    })
  }

  proceed(){
    if(this.image && this.image.path){
      let imageNumber=1;
      this.common.presentLoader();
      this.fileSrvc.uploadPhoto('image_'+imageNumber+'.jpg',this.image.path,this.property.id,imageNumber).then(res=>{
        console.log(res);
        if(res && res.response && JSON.parse(res.response) && JSON.parse(res.response).data){
          this.property['image']={
            ...this.image,
            ...JSON.parse(res.response).data
          }
          this.propertiesSrvc.newProperty.next(this.property)
          this.navCtrl.navigateForward(['../upload-coordinates'],{relativeTo:this.activatedRoute,
            queryParams:{
              page:'external'
            }})
        }
        else{
          this.common.presentToast('Server error. Please try again later or contact support.!')
        }
      }).catch(err=>{
        console.log(err)
        this.common.presentToast('Unable connect to server. Please try again later or contact support.!')
      }).finally(()=>{
        this.common.dismissLoader();
      })
    }
    else{
      //no change in image, existing image
      this.navCtrl.navigateForward(['../upload-coordinates'],{relativeTo:this.activatedRoute,
        queryParams:{
          page:'external'
        }})
    }
  }

  exit(){
    this.common.presentAlertForConfirmation('exit_new_property','Confirm').then(()=>{
      this.propertiesSrvc.newProperty.next(null)
      this.propertiesSrvc.editedProperty.next(true);
      this.propertiesSrvc.needListingRefresh = true;
      this.navCtrl.navigateRoot('/seller')
    })
  }
}
