import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Common } from '../shared/common';
import { environment } from '../../environments/environment';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult } from '@ionic-native/file-transfer/ngx';
import { GlobalConfigService } from './global-config.service';
import { LoggerService } from '../core/logger.service';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  public bookingEventData = new BehaviorSubject(null)
  constructor(
    public http: HttpClient,
    private common: Common,
    private globalConst: GlobalConfigService,
    private transfer: FileTransfer,
    private logger:LoggerService,
  ) { }

  createBookingRequest(data) {
    return this.http.post(environment.config.apiEndPoint + 'ShowdayBookings/create_booking', data)
  }

  createBookingRequestWithPassport(data):Promise<any>{
    return new Promise((resolve,reject) => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      // .replace('file://', 'capacitor-asset://');
      const options: FileUploadOptions = {
        fileKey: 'file',
        fileName: 'image.jpg',
        mimeType: 'image/jpg',
        chunkedMode: false,
        params: data,
        headers: {
          'Authorization-Key' : this.globalConst.authToken,
          'Device-Id' : this.globalConst.deviceInfo.uuid
        }
      };
      this.logger.log("Upload Image : Req :",options)
      fileTransfer.upload(data.imagePath, this.globalConst.apiEndPoint+"ShowdayBookings/create_booking", options)
        .then((result:FileUploadResult) => {
          // success
        this.logger.log("Upload Image : Res :",result)
        resolve(result);
        }, (err) => {
          // error
          this.logger.error("Upload Image : Res :",err)
          reject(err);
        });
    });
  }

  getBookings(params){
    let query = this.common.obToquery(params);
    if (query !== '') {
        query = '?' + query;
    }
    return this.http.get(environment.config.apiEndPoint + 'ShowdayBookings/fetch_bookings' + query)
  }

  update_verification_status(data){
    return this.http.post(environment.config.apiEndPoint + 'ShowdayBookings/update_verification_status', data)
  }

  update_booking_status(data){
    return this.http.post(environment.config.apiEndPoint + 'ShowdayBookings/update_booking_status', data)
  }

  update_walkin_status(data){
    return this.http.post(environment.config.apiEndPoint + 'ShowdayBookings/update_walkin_status', data)
  }

  createWalkIn(data) {
    return this.http.post(environment.config.apiEndPoint + 'ShowdayBookings/create_walk_in', data)
  }

}
