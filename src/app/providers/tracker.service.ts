import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Common } from '../shared/common';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { GlobalConfigService } from './global-config.service';
import { LoggerService } from '../core/logger.service';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  public detailObj$ = new BehaviorSubject({});
  public needsRefresh$ = new BehaviorSubject(false);
  constructor(private globalConst: GlobalConfigService,
    private transfer: FileTransfer,
    public http: HttpClient,
    private common: Common,
    private logger: LoggerService) { }
  

  getList(params?) {
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Tracker/list' + query)
  }

  getSet(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Tracker/set' + query)
  }
  getImages(params?) {
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'Tracker/images' + query)
  }

  upsertSet(params) {
    return this.http.post(environment.config.apiEndPoint + 'Tracker/upsert_set', params)
  }

  deleteSet(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.delete(environment.config.apiEndPoint + 'Tracker/set' + query)
  }

  deleteImage(params) {
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.delete(environment.config.apiEndPoint + 'Tracker/image' + query)
  }

  uploadPhoto(fileName: string, uripath: any, setId): Promise<any> {
    return new Promise((resolve, reject) => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      // .replace('file://', 'capacitor-asset://');
      const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName,
        mimeType: 'image/jpg',
        chunkedMode: false,
        params: {
          "id": setId
        },
        headers: {
          'Authorization-Key': this.globalConst.authToken,
          'Device-Id': this.globalConst.deviceInfo.uuid
        }
      };
      this.logger.log("Upload Image : Req :", options)
      fileTransfer.upload(uripath, this.globalConst.apiEndPoint + "Tracker/upload_image", options)
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
}
