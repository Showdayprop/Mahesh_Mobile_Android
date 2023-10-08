import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/logger.service';
import { PropertiesService } from '../../providers/properties.service';
import { UtilityService } from '../../providers/utilities.service';
import { Common } from '../../shared/common';

declare function activateWalkMode():any;
declare function activateSurroundMode():any;
declare function moveForward():any;
declare function moveBackword():any;
@Component({
  selector: 'app-property-tour',
  templateUrl: './property-tour.page.html',
  styleUrls: ['./property-tour.page.scss'],
})
export class PropertyTourPage implements OnInit, AfterViewInit {

  propertyData: any;
  propertId: any;
  pageSubscriptions = new Subscription();
  script;
  modelLink;
  
  constructor(
    private _renderer2: Renderer2, 
    @Inject(DOCUMENT) private _document: Document,
    public navCtrl: NavController,
    public dialog: MatDialog,
    private common: Common,
    private propertySrvc: PropertiesService,
    private domSanitizer: DomSanitizer,
    private logger: LoggerService,
    private utilitySrvc: UtilityService
  ) { 
    this.pageSubscriptions.add(this.propertySrvc.propertyDetail.subscribe((data: any) => {
      this.propertyData = data;
      if (data && data.id) {
        this.propertId = data.id;
        this.logger.log("PropertyMapPage : constructor : data received : ", this.propertId);
        this.modelLink = environment.config.storagePath + this.propertId + "/model/" + data.model_link;
      }
      else {
        this.logger.error("PropertyMapPage : constructor : empty data ");
      }
    }))
  }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.script = this._renderer2.createElement('script');
    this.script.id = "xyz";
    this.script.src = "../../../assets/js/model-viewer.js";
    this._renderer2.appendChild(this._document.body, this.script);
  }

  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkForPropertyModel(this.propertyData.id)
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

  walkMode(){
    activateWalkMode();
  }

  surroundMode(){
    activateSurroundMode();
  }

  forward(){
    moveForward();
  }

  backword(){
    moveBackword();
  }

  ngOnDestroy() {
    this.pageSubscriptions.unsubscribe();
  }
}
