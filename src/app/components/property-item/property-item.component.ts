import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PropertiesService } from './../../providers/properties.service';
import { Common } from './../../shared/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-property-item',
  templateUrl: './property-item.component.html',
  styleUrls: ['./property-item.component.scss'],
})
export class PropertyItemComponent implements OnInit {
  @Input() property: any;
  @Input() page: string;
  @Input() userSettings: any;
  @Output() deleteProperty = new EventEmitter<any>();
  @Output() editProperty = new EventEmitter<any>();
  @Output() markAttendance = new EventEmitter<any>();
  @Output() openDetail = new EventEmitter<any>();
  path = environment.config.storagePath;
  isExternalURL: boolean = false;
  constructor(private common: Common,
    private propertiesSrvc: PropertiesService,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    if (this.property && this.property.external_url && this.property.external_url != "") {
      this.isExternalURL = true;
    }
  }
  delete(propId) {
    this.common.presentAlertForConfirmation('Are you sure you want to delete this listing?', 'Confirm Delete').then(() => {
      this.deleteProperty.emit(propId)
    })
  }
  edit(propId) {
    this.editProperty.emit(propId)
  }
  detail(property) {
    this.openDetail.emit(property);
  }
  attendance(property){
    this.markAttendance.emit(property);
  }
  bookShowday(propID) {
    this.propertiesSrvc.propertyDetail.next(this.property)
    this.navCtrl.navigateForward(['../booking'], { relativeTo: this.activatedRoute, queryParams: { role: 'buyer' } })
  }
  changePropertyStatus(ev, property) {
    this.propertiesSrvc.changePropertyVisibility({ id: property.id, change: ev.target.checked ? 'Unhide' : 'Hide' }).toPromise().then(res => {
      if (res == 'success') {
        property.visibility = ev.target.checked ? 'Unhide' : 'Hide';
        this.common.presentToast(ev.target.checked ? 'property_toggle_live' : 'property_toggle_not_live')
      }
    })
  }

}
