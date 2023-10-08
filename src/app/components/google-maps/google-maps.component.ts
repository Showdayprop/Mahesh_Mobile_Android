import { UtilityService } from './../../providers/utilities.service';
/// <reference types="@types/googlemaps"/>
import { Component, OnInit, Input, Renderer2, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Plugins } from '@capacitor/core';
import { environment } from '../../../environments/environment';
const { Geolocation, Network } = Plugins;
@Component({
  selector: 'google-map',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit {

  apiKey: string = environment.config.gApiKey;

  public map: any;
  public markers: any[] = [];
  private networkHandler = null;

  constructor(private renderer: Renderer2, private element: ElementRef, @Inject(DOCUMENT) private _document,
    private utilitySrvc:UtilityService) { }

   ngOnInit() {
    // this.init().then((res) => {
    //   console.log("Google Maps ready.")
    // }, (err) => {    
    //     console.log(err);
    // });
  }
/*
  private init(): Promise<any> {
    return new Promise((resolve, reject) => {
        this.loadSDK().then((res) => {
          this.initMap().then((res) => {
              resolve(true);
          }, (err) => {
              reject(err);
          });
        },(err) => {
          reject(err);
        });
    });
  }

  private loadSDK(): Promise<any> {
    console.log("Loading Google Maps SDK");
    return new Promise((resolve, reject) => {
      if(!this.utilitySrvc.mapsLoaded){
        Network.getStatus().then((status) => {
          if(status.connected){
            this.injectSDK().then((res) => {
                resolve(true);
            }, (err) => {
                reject(err);
            });
          } else {
            if(this.networkHandler == null){
              this.networkHandler = Network.addListener('networkStatusChange', (status) => {
                if(status.connected){
                  this.networkHandler.remove();
                  this.init().then((res) => {
                    console.log("Google Maps ready.")
                  }, (err) => {    
                    console.log(err);
                  });

                }
              });
            }
            reject('Not online');
          }
        }, (err) => { 
          // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
          if(navigator.onLine){
            this.injectSDK().then((res) => {
              resolve(true);
            }, (err) => {
              reject(err);
            });
          } else {
            reject('Not online');
          }
        });
      } else {
        reject('SDK already loaded');
      }
    });
  }

  private injectSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      window['mapInit'] = () => {
        this.utilitySrvc.mapsLoaded = true;
        resolve(true);
      }
      // if ((window['googleMaps'] !== undefined)) {
      //   this.utilitySrvc.mapsLoaded = true;
      //   resolve(true);
      //   return;
      // }
      let script = this.renderer.createElement('script');
      script.id = 'googleMaps';
      if(this.apiKey){
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
      } else {
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';       
      }
      this.renderer.appendChild(this._document.body, script);
    });
  }

  private initMap(): Promise<any> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition().then((position) => {
        console.log(position);
        let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        let mapOptions = {
          center: latLng,
          zoom: 15
        };
        this.map = new google.maps.Map(this.element.nativeElement, mapOptions);
        this.addMarker(position.coords.latitude, position.coords.longitude)
        resolve(true);
      }, (err) => {
        reject('Could not initialise map');
      });
    });
  }

  public addMarker(lat: number, lng: number): void {
    let latLng = new google.maps.LatLng(lat, lng);
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });
    this.markers.push(marker);
  } */

}
