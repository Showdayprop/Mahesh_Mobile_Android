import { LoggerService } from './../../../core/logger.service';
import { NavController } from '@ionic/angular';
import { Common } from './../../../shared/common';
import { FileService } from './../../../providers/file.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CameraHelperService } from './../../../providers/camera-helper.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PropertiesService } from '../../../providers/properties.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-multiple-img-capture',
  templateUrl: './multiple-img-capture.component.html',
  styleUrls: ['./multiple-img-capture.component.scss'],
})
export class MultipleImgCaptureComponent implements OnInit {
  // @ViewChild('myPond',{static:false}) myPond: any;
  property;
  images = [];
  // order:any=[];
  uploaderBusy:boolean = false;
  //status 0 -> Pending, 1-> uploading, 2-> Uploaded

  constructor(private cameraHlprSrvc:CameraHelperService,
    private propertiesSrvc:PropertiesService,
    private domSanitizer: DomSanitizer,
    private fileSrvc:FileService,
    private common:Common,
    private navCtrl:NavController,
    private logger:LoggerService) {
    this.property = this.propertiesSrvc.newProperty.getValue();
    // this.property.id = '2388'
    this.propertiesSrvc.getPropertyImages({id:this.property.id}).toPromise().then(res=>{
      if(res && res['property_images'] && res['property_images'].length>0){
        this.images = res['property_images'].map(el => {
          let o = Object.assign({}, el);
          o.status = 2;
          o.src = environment.config.storagePath + o.property_id + '/medium/' + o.gallery_image;
          return o;
        })
      }
    })
  }

  ngOnInit() {}
  /* pondServer = {
    process:(fieldName, file, metadata, load, error, progress, abort) => {
      // debugger
      // this.myPond.removeFiles();
      // this.startUpload(file,0)
      const fd = new FormData();
      console.log(this.myPond);
      fd.append('property_id', '2398');
      fd.append('img_num', this.order.length);
      fd.append('file',file,file.name);
      this.fileSrvc.uploadBlob(fd).toPromise().then((res:any)=>{
        load('success')
        this.order.push(res.data)
      }).catch(err=>{
        error(err)
      })
      // custom file processing here
      // https://pqina.nl/filepond/docs/patterns/api/server/#advanced
    },
    load: (source, load, error, progress, abort, headers) => {
      var myRequest = new Request(source);
      fetch(myRequest).then(function(response) {
        response.blob().then(function(myBlob) {
          load(myBlob)
        });
      });         
    },
    fetch: (url, load, error, progress, abort, headers) => {},
  }
  pondOptions = {
    class: 'my-filepond',
    multiple: true,
    maxFiles: 10,
    allowDrop:false,
    allowBrowse:true,
    allowRevert:true,
    maxParallelUploads:1,
    allowReorder:false,
    labelIdle: 'Select from gallery',
    acceptedFileTypes: 'image/jpeg, image/png',
    server: this.pondServer // connect server config above
  }

  pondFiles = [{
    source:"https://www.showday.com/storage/2385/1594817471_4-Disa-Drive-46-Cosmos-drive-07152020_142941.jpg",
    options: {
      type: "local"
    }
  }
  ]

  pondHandleInit() {
    console.log('FilePond has initialised', this.myPond);
  }

  pondHandleAddFile(event: any) {
    console.log('A file was added', event);
  }
  pondHandleRemoveFile(event: any) {
    console.log('A file was removed', event);
    debugger
  } */
  ionViewWillEnter(){
    this.property = this.propertiesSrvc.newProperty.getValue();
  }
  takePicture() {
    this.cameraHlprSrvc.capturePhotoURI().then(image=>{
      // this.myPond.addFile(image.webPath);
      let img = {
        src:this.domSanitizer.bypassSecurityTrustResourceUrl(image && (image.webPath)),
        path:image.path,
        status:0
      }
      this.images.push(img)
    }).catch(err=>{
      console.log(err)
    })
  }

  // uploadBlob(blob,){
  //   const fd = new FormData();
  //   fd.append('file',blob,blob.name);
  //   this.fileSrvc.uploadBlob(fd);
  // }
  startUpload(img,index){
    this.logger.log("multipleImgCaptureComponent : startUpload :", index,':',img)
    img.status = 1;
    this.uploaderBusy = true;
    this.fileSrvc.uploadPhoto('image_'+index+'.jpg',img.path,this.property.id,index).then(res=>{
      console.log(res);
      if(res && res.response && JSON.parse(res.response) && JSON.parse(res.response).data){
        img.status = 2;
        img = {...img,...JSON.parse(res.response).data};
        this.images[index] = img;
      }
      else{
        img.status = 0;
        this.common.presentToast('Server error. Please try again later or contact support.!')
      }
    }).catch(err=>{
      console.log(err)
      img.status = 0;
      this.common.presentToast('Unable connect to server. Please try again later or contact support.!')
    }).finally(()=>{
      this.uploaderBusy = false;
    })
  }

  deleteImage(img, pos){
    this.logger.log("multipleImgCaptureComponent : deleteImage :", pos,':',img)
    this.propertiesSrvc.deleteImage({
      property_id:this.property.id,
      id:img.id
    }).toPromise().then(res=>{
      if(res=='success'){
        this.images.splice(pos,1);
      }
      else{
        this.common.presentToast('error_response')
      }
    })
  }

  checkImageUploads():boolean{
    return this.images.filter(el=>el.status==2).length == 0
  }

  finish(){
    this.common.presentLoader();
    let data = this.images.map((el,index)=>{
      return {
        id:el.id,
        dis_order:index+1
      }
    })
    this.propertiesSrvc.updateImageOrder({property_id:this.property.id,array:data}).toPromise().then(res=>{
      this.logger.log("multipleImgCaptureComponent : finish : updateImageOrder : success") 
    }).catch(err=>{
      this.logger.error("multipleImgCaptureComponent : finish : updateImageOrder : catch",err) 
    }).finally(()=>{
      this.common.dismissLoader();
      this.logger.log("multipleImgCaptureComponent : finish : updateImageOrder : finally") 
      if(this.property.visibility && this.property.visibility =="Hide"){
        this.common.presentAlertForConfirmation('Save to Drafts or Publish Live?','Alert','Publish','Save To Drafts').then(res=>{
        //user clicked yes
          this.logger.log("multipleImgCaptureComponent : finish : Make LIVE")
          this.propertiesSrvc.changePropertyVisibility({id:this.property.id,change:'Unhide'}).toPromise().then(res=>{
            if(res =='success'){
              this.common.presentToast('The property listing is Live.!')
            }
            this.propertiesSrvc.newProperty.next(null);
            this.navCtrl.navigateRoot('/seller')
          })
        }).catch(()=>{
          //cancelled
          this.logger.log("multipleImgCaptureComponent : finish : DRAFT")
          this.propertiesSrvc.newProperty.next(null)
          this.propertiesSrvc.needListingRefresh = true;
          this.navCtrl.navigateRoot('/seller')
        })
      }
      else{
        this.propertiesSrvc.newProperty.next(null);
        this.navCtrl.navigateRoot('/seller')
      }
    })    
  }
  onRenderItems(event) {
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);
     let draggedItem = this.images.splice(event.detail.from,1)[0];
     this.images.splice(event.detail.to,0,draggedItem)
    //this.listItems = reorderArray(this.listItems, event.detail.from, event.detail.to);
    event.detail.complete();
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
