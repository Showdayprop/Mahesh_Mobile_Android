import { UserManagementService } from './../../../providers/user-management.service';
import { DirectoryService } from './../../../providers/directory.service';
import { LoggerService } from './../../../core/logger.service';
import { UtilityService } from './../../../providers/utilities.service';
import { Common } from './../../../shared/common';
import { Plugins } from '@capacitor/core';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import * as L from 'leaflet';
import * as MC from 'leaflet.markercluster';
import { ChatService } from '../../../providers/chat.service';
import { NotificationService } from '../../../providers/notification.service';

@Component({
  selector: 'app-provider-detail',
  templateUrl: './provider-detail.component.html',
  styleUrls: ['./provider-detail.component.scss'],
})
export class ProviderDetailComponent implements OnInit {
  item: any;
  list
  path = environment.config.storagePath;
  map;
  blueIcon: { icon: any; };
  greenIcon: { icon: any; };
  redIcon: { icon: any; };
  userLoc: any;
  constructor(private navParams: NavParams,
    private modalCtrl: ModalController,
    public common: Common,
    private logger: LoggerService,
    private utilitySrvc: UtilityService,
    private directorySrvc: DirectoryService,
  private userMgmtSrvc:UserManagementService,
    private chatSrvc: ChatService,
    public navCtrl: NavController,
    private notificationSrvc:NotificationService) {
    this.item = navParams.get('item')
    this.list = navParams.get('data')
    if (!this.item && navParams.get('id')) {
      //this came from the dynamic link page
      let id = navParams.get('id')
      this.getDetails(id);
    }
    this.userLoc = this.utilitySrvc.getLocationData();
    if (!this.userLoc) {
      this.userLoc = {
        latitude: "-26.034294",
        longitude: "28.066144"
      }
    }
  }

  ngOnInit() {
    this.defineMarkerIcons();
  }
  dismissModal() {
    this.modalCtrl.dismiss();
  }
  async getDetails(id) {
    this.common.presentLoader()
    this.item = await this.directorySrvc.getServiceProviderDetails({ id: id }).toPromise();
    this.list = await this.directorySrvc.getServicesForProvider({ id: id }).toPromise()
    this.common.dismissLoader();
    if (!this.item || Object.keys(this.item).length === 0) {
      this.common.presentPopupAlertForOK('No such service provider exists.')
    }
    if (!this.list || this.list.length == 0) {
      this.common.presentPopupAlertForOK('No services offered by this provider.')
    }
    if (!this.map && this.list) {
      this.initMap(this.list['locations'])
    }
    // if (this.map) {
    //   this.addMarkerCluster(this.list['locations']);
    // }
  }

  defineMarkerIcons() {
    this.blueIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/bluepointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
    this.greenIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/greenpointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
    this.redIcon = {
      icon: new L.Icon({
        iconUrl: '../../assets/icons/redpointer3f.png',
        shadowUrl: '../../assets/icons/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
  }

  ionViewWillEnter() {
    setTimeout(() => {
      if (!this.map && this.list) {
        this.initMap(this.list['locations'])
      }
    }, 500);
  }
  initMap(locations) {
    if (!locations || locations.length == 0) {
      return;
    }
    this.map = L.map('providerMap', { "tap": false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
    this.addMarkerCluster(locations);
  }
  addMarkerCluster(locations) {
    let markers = new MC.MarkerClusterGroup();
    let defaultLoc;
    locations.forEach((a, i) => {
      let marker: any;
      if (a.area_lat && a.area_long) {
        marker = L.marker(new L.LatLng(a.area_lat, a.area_long), this.blueIcon)
        // marker.bindPopup("<b>Area</b><br>" + a.area + "<br>Providers : " + a.count).on("click", (e) => {
        //   this.markerClick(e, a);
        // });
      }
      else if (a.estate_lat && a.estate_long) {
        marker = L.marker(new L.LatLng(a.estate_lat, a.estate_long), this.redIcon)
        // marker.bindPopup("<b>Estate</b><br>" + a.estate + "<br>Providers : " + a.count).on("click", (e) => {
        //   this.markerClick(e, a);
        // });
      }
      else if (a.lat && a.long) {
        marker = L.marker(new L.LatLng(a.lat, a.long), this.greenIcon)
        // marker.bindPopup("<b>Shop</b><br>").on("click", (e) => {
        //   this.markerClick(e, a);
        // });
      }
      markers.addLayer(marker);
      if (i == 0) {
        defaultLoc = marker.getLatLng();
      }
    });
    this.map.addLayer(markers);
    this.map.setView(
      [defaultLoc.lat, defaultLoc.lng], 13)
  }
  async share() {
    this.common.presentLoader();
    let url = await this.utilitySrvc.createDynamicLinkCommon('provider', this.item.account_id)
    if (url) {
      this.logger.log('ProviderDetailPage : share : deeplinked share url', url);
      this.common.dismissLoader();
      await Plugins.Share.share({
        title: "Services on offer by " + this.item.affiliate_name,
        text: "Checkout the list of services in Showday Mobile App",
        url: url.toString(),
        dialogTitle: 'Share With Friends & Family'
      });
    } else {
      this.common.dismissLoader();
      this.common.presentToast('Unable to generate a shareable link. Please contact support team.')
    }
  }
  startChat() {
    let userData = this.userMgmtSrvc.user.getValue();
    if(!userData['isLoggedIn']){
      // the user is not logged in, so send them to login page
      this.common.presentToast('Please Login to use this feature', 'Login Required', 5000)
      this.navCtrl.navigateRoot(['/login'])
    }
    else {
      // send an invite to the concerned person
      this.chatSrvc.inviteUser( this.item.account_id).then((resp: any) => {
        console.log(resp)
        if (resp.status = 'success' && resp.msg) {
          this.common.presentToast(resp.msg)
          if (resp.room) {
            // update the data to behavioursubject
            this.notificationSrvc.notificationData$.next(resp);
            // take the user to the chat room
            this.navCtrl.navigateForward(['/chat'])
          }
        }
        else if(resp.msg) this.common.presentToast(resp.msg)
      })
    }
    this.dismissModal();
  }
  ngOnDestroy() {
    this.map.remove();
  }
}
