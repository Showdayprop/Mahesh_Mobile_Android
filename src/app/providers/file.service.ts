import { LoggerService } from './../core/logger.service';
import { GlobalConfigService } from './global-config.service';
import { Injectable } from '@angular/core';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { decode } from "base64-arraybuffer";

const { Filesystem } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private globalConst: GlobalConfigService,
    private transfer: FileTransfer,
    public http: HttpClient,
    private logger: LoggerService) { }

  writeFile(fileName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      Filesystem.writeFile({
        data: data,
        path: fileName,
        directory: FilesystemDirectory.Data
      }).then((res) => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  getFileURI(fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      Filesystem.getUri({
        directory: FilesystemDirectory.Data,
        path: fileName
      }).then((result) => {
        resolve(result);
        // let uripath = result.uri.replace('file://', 'capacitor-asset://');
      }, err => {
        reject(err);
      });
    });
  }

  uploadPhoto(fileName: string, uripath: any, propertyId, imageNumber: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      // .replace('file://', 'capacitor-asset://');
      const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName,
        mimeType: 'image/jpg',
        chunkedMode: false,
        params: {
          "property_id": propertyId,
          "img_num": imageNumber,
        },
        headers: {
          'Authorization-Key': this.globalConst.authToken,
          'Device-Id': this.globalConst.deviceInfo.uuid
        }
      };
      this.logger.log("Upload Image : Req :", options)
      fileTransfer.upload(uripath, this.globalConst.apiEndPoint + "PropertyRequests/upload_image", options)
        .then((result) => {
          // success
          this.logger.log("Upload Image : Res :", result)
          resolve(result);
        }, (err) => {
          // error
          this.logger.error("Upload Image : Res :", err)
          reject(err);
        });
    });
  }
  uploadBlob(fd) {
    return this.http.post(environment.config.apiEndPoint + 'PropertyRequests/upload_image', fd)
  }

  async readFilePath(uri) {
    try {
      let data = await Filesystem.readFile({
        path: uri,
        directory: FilesystemDirectory.Data
      })
      const imageBlob = new Blob([new Uint8Array(decode(data.data))], {
        type: `image/${uri.substr(uri.lastIndexOf('.') + 1, uri.length)}`
      });
      // const imageFile = new File([imageBlob], 'test.jpeg', { type: 'image/jpeg' })
      // console.log(imageBlob)

      console.log(imageBlob)
      return data.data;
    }
    catch (err) {
      console.log(err)
    }
  }
  convertFileToBlob(base64, type) {
    return new Blob([new Uint8Array(decode(base64))], {
      type: `image/${type}`
    });
  }
  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  uploadPhotoWithProgress(uripath: any, fileName: string, endpoint, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      // .replace('file://', 'capacitor-asset://');
      const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName,
        mimeType: 'image/jpg',
        chunkedMode: false,
        params: params,
        headers: {
          'Authorization-Key': this.globalConst.authToken,
          'Device-Id': this.globalConst.deviceInfo.uuid
        }
      };
      fileTransfer.upload(uripath, this.globalConst.apiEndPoint + endpoint, options)
        .then((result) => {
          // success
          this.logger.log("Upload Image : Res :", result)
          resolve(result);
        }, (err) => {
          // error
          this.logger.error("Upload Image : Res :", err)
          reject(err);
        });
    });
  }

  async deleteFile(path) {
    Filesystem.deleteFile({
      path: path,
      directory: FilesystemDirectory.Data
    }).then(delRes => console.log(delRes))
  }
}
