import { LoggerService } from './../../core/logger.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-logs',
  templateUrl: './device-logs.page.html',
  styleUrls: ['./device-logs.page.scss'],
})
export class DeviceLogsPage implements OnInit {
  logs;
  subscription;
  constructor(private logger: LoggerService) {
  }

  ngOnInit() {
    this.subscription = this.logger.inDeviceLog.subscribe(d => {
      this.logs = d
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

}
