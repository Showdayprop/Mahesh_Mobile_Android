import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  storage:any;
  isPlatformMobile;
  constructor( public platform: Platform) { 
    this.storage = Storage;
  }

  ngOnInit() {
    // this.platform.ready().then(() => {
    //   if(this.platform.is('ios') || this.platform.is('android')) {
    //     this.isPlatformMobile = true;
    //   } else {
    //     this.isPlatformMobile = false;     
    //   }
    //   this.storage = Storage;
    // });
  }

  // JSON "set" object
  async setObject(keyVal:string,jsonObj) {
    await this.storage.set({
      key: keyVal,
      value: JSON.stringify(jsonObj)
    });
  }

  // JSON "get" object 
  async getObject(keyVal:string) {
    let strObject = await this.storage.get({ key: keyVal });
    if (strObject) {
      return JSON.parse(strObject.value)
    }
    return null
  }   

  //Set Item
  async setItem(keyVal:string,val) {
    await this.storage.set({
      key: keyVal,
      value: val
    });
  }

  //Get Item
  async getItem(keyVal:string) {
    let item = await this.storage.get({ key: keyVal });
    return item ? item.value : null
  }

  async removeItem(keyVal:string) {
    await this.storage.remove({ key: keyVal });
  }

  async keys() {
    const keys = await this.storage.keys();
    return keys.keys;
  }

  async clear() {
    await this.storage.clear();
  }
}
