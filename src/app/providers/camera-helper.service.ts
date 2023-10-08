import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { FileService } from './file.service';
const { Camera, Filesystem } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class CameraHelperService {

  constructor(private fileSrvc: FileService) { }
  async capturePhotoURI(source?): Promise<any> {
    let photoSrc: CameraSource;
    if (source == 'camera') {
      photoSrc = CameraSource.Camera
    }
    else if (source == 'gallery') {
      photoSrc = CameraSource.Photos
    }
    else {
      photoSrc = CameraSource.Prompt
    }
    return await new Promise((resolve, reject) => {
      Camera.getPhoto({
        quality: 70,
        saveToGallery: false,
        resultType: CameraResultType.Uri,
        source: photoSrc,
        correctOrientation:false
      }).then((photo) => {
        resolve(photo)
      }, err => {
        reject(err);
      });
    });
  }

  async capturePhotoDataURL(fileName, source?): Promise<any> {
    //TODO CameraResultType.Uri is failing when we select photo from gallery option.
    //check if this is fixed in future
    let photoSrc: CameraSource;
    if (source == 'camera') {
      photoSrc = CameraSource.Camera
    }
    else if (source == 'gallery') {
      photoSrc = CameraSource.Photos
    }
    else {
      photoSrc = CameraSource.Prompt
    }
    return await new Promise((resolve, reject) => {
      Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: photoSrc
      }).then((photo) => {
        console.log(photo);
        let imgData = photo.dataUrl
        // let imgData = 'data:image/jpeg;base64,' + photo['base64String'];
        this.fileSrvc.writeFile(fileName, imgData).then(res => {
          if (res && res.uri) {
            resolve({ uri: res.uri });
          }
          else {
            this.fileSrvc.getFileURI(fileName).then(res2 => {
              //res.uri
              resolve({ uri: res2.uri });
            }, err => {
              reject(err);
            })
          }
        }, err => {
          reject(err);
        })
      }, err => {
        reject(err);
      });
    });
  }
}
