import { Component, OnInit, Sanitizer } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { App, Plugins } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/logger.service';
import { PropertiesService } from '../../providers/properties.service';
import { UtilityService } from '../../providers/utilities.service';
import { Common } from '../../shared/common';

@Component({
  selector: 'app-property-video',
  templateUrl: './property-video.page.html',
  styleUrls: ['./property-video.page.scss'],
})
export class PropertyVideoPage implements OnInit {

  propertyData: any;
  propertId: any;
  pageSubscriptions = new Subscription();
  
  constructor(
    public navCtrl: NavController,
    public dialog: MatDialog,
    private common: Common,
    private propertySrvc: PropertiesService,
    private domSanitizer: DomSanitizer,
    private logger: LoggerService,
    private sanitizer: DomSanitizer,
    private utilitySrvc: UtilityService,
    public platform: Platform,
  ) { 
    this.pageSubscriptions.add(this.propertySrvc.propertyDetail.subscribe((data: any) => {
      this.propertyData = data;
      if (data && data.id) {
        this.propertId = data.id;
        this.logger.log("PropertyMapPage : constructor : data received : ", this.propertId);
      }
      else {
        this.logger.error("PropertyMapPage : constructor : empty data ");
      }
    }))
  }

  ngOnInit() {
  }

  videoURL() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.propertyData.video_link);
  }

  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkForPropertyVideo(this.propertyData.id)
    if (url) {
      this.logger.log('PropertyMapPage : share : deeplinked share url', url);
      this.common.dismissLoader();
      await Plugins.Share.share({
        title: this.propertyData.property_type + ' For ' + this.propertyData.available_for + ' in ' + this.propertyData.area,
        text: this.propertyData.property_name + '. Open in Showday Mobile App:',
        // url: url.toString() + '?id=' + this.propertyData.id,
        url: url.toString(),
        dialogTitle: 'Share With Friends & Family'
      });
    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }

  openVideo(){
    window.open(this.propertyData.video_link);
  }

  ngOnDestroy() {
    this.pageSubscriptions.unsubscribe();
  }
}
