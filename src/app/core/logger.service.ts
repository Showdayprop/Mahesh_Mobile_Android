import { BehaviorSubject } from 'rxjs';
import { StorageService } from './../providers/storage.service';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Bugfender } from 'cordova-plugin-bugfender/www/bugfender';
// import { Analytics } from 'capacitor-analytics';
// const analytics = new Analytics();

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public inDeviceLog = new BehaviorSubject('');
  pendingLogs = '';
  logsReadFromStorage = false;
  logString = '';
  constructor(private storageSrvc: StorageService) {
    this.storageSrvc.getItem('logs').then(data => {
      if (data) {
        this.pendingLogs += data;
      }
      this.inDeviceLog.next(this.pendingLogs)
      this.logString = this.pendingLogs;
      this.pendingLogs = ''
      this.storageSrvc.setItem('logs', this.logString)
      this.logsReadFromStorage = true;
    })
  }

  updateInDeviceLogs(log) {
    this.pendingLogs += log;
    if (this.logsReadFromStorage) {
      this.logString += this.pendingLogs + log;
      this.pendingLogs = ''
      this.storageSrvc.setItem('logs', this.logString)
      this.inDeviceLog.next(log)
    }
  }

  log(...details: any[]) {
    if (!environment.loggingEnabled) {
      return;
    }
    Bugfender.log(...details)
  }

  error(...details: any[]) {
    if (!environment.loggingEnabled) {
      return;
    }
    Bugfender.error(...details)
  }

  setDeviceKey(value: any) {
    if (!environment.loggingEnabled) {
      return;
    }
    Bugfender.setDeviceKey('user', value)
  }

  removeDeviceKey() {
    if (!environment.loggingEnabled) {
      return;
    }
    Bugfender.removeDeviceKey('user')
  }

}
