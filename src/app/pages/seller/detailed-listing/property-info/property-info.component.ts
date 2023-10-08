import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from '../../../../providers/utilities.service';
import { PropertiesService } from '../../../../providers/properties.service';
import { Common } from '../../../../shared/common';
import cloneDeep from 'lodash.clonedeep';

@Component({
  selector: 'app-property-info',
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.scss'],
})
export class PropertyInfoComponent implements OnInit {
  propertyForm:FormGroup;
  DECIMAL_SEPARATOR=".";
  GROUP_SEPARATOR=",";
  property;
  constructor(private navCtrl:NavController,
    private activatedRoute:ActivatedRoute,
    private formBuilder:FormBuilder,
    private utilitySrvc:UtilityService,
    private propertiesSrvc:PropertiesService,
    private common:Common) { 
      this.property = this.propertiesSrvc.newProperty.getValue();
    }

  ngOnInit() {
    this.propertyForm = this.formBuilder.group({
      bedrooms:['', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]+$')])],
      bathrooms:['', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]+$')])],
      parkings:['', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]+$')])],
      landSize:['', Validators.compose([
        Validators.pattern('[0-9]+$')])],
      buildingSize:['', Validators.compose([
        Validators.pattern('[0-9]+$')])],
      levies:['', Validators.compose([
        Validators.pattern('[0-9,]+$')])],
      ratesTaxes:['', Validators.compose([
        Validators.pattern('[0-9,]+$')])]
    })

    if(this.property && this.property.id){
      this.propertyForm.controls.bedrooms.setValue(this.property.num_bedroom);
      this.propertyForm.controls.bathrooms.setValue(this.property.num_bathroom);
      this.propertyForm.controls.parkings.setValue(this.property.num_carparking);
      this.propertyForm.controls.landSize.setValue(this.property.landsize_approx);
      this.propertyForm.controls.buildingSize.setValue(this.property.buildings_approx);
      this.propertyForm.controls.levies.setValue(this.property.levis_approx);
      this.propertyForm.controls.ratesTaxes.setValue(this.property.tax_approx);
    }
  }

  ionViewWillEnter(){
      this.property = this.propertiesSrvc.newProperty.getValue();
  }
  format(ev) {
    let valString = ev.target.value
    if (!valString) {
        return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)
  };

  unFormat(val) {
      if (!val) {
          return '';
      }
      val = val.replace(/^0+/, '').replace(/\D/g,'');
      if (this.GROUP_SEPARATOR === ',') {
          return val.replace(/,/g, '');
      } else {
          return val.replace(/\./g, '');
      }
  };

  saveContinue(){
    this.common.presentLoader();
    if(this.propertyForm.value.levies){
      this.propertyForm.value.levies = this.propertyForm.value.levies.replace(/,/g, '');
    }
    if(this.propertyForm.value.ratesTaxes){
      this.propertyForm.value.ratesTaxes = this.propertyForm.value.ratesTaxes.replace(/,/g, ''); 
    }
    let data = {
      ...this.propertyForm.value,
      "id":this.property.id,
    }
    this.propertiesSrvc.updatePropertySpecs(data).toPromise().then((res:any)=>{
      if(res && res.toLowerCase() == "success"){
        data = {...this.property,...data};
        this.property = cloneDeep(data);
        this.propertiesSrvc.newProperty.next(data);
        this.navCtrl.navigateForward(['../upload-coordinates'],{relativeTo:this.activatedRoute,
          queryParams:{
            page:'detailed'
          }})
      }
      else{
        this.common.presentToast('error_response')
      }
    }).catch(err=>{
      this.common.presentToast('server_request_error')
    }).finally(()=>{
      this.common.dismissLoader();
    })
  }
  exit(){
    this.common.presentAlertForConfirmation('exit_new_property','Confirm').then(()=>{
      this.propertiesSrvc.newProperty.next(null)
      this.propertiesSrvc.editedProperty.next(true);
      this.propertiesSrvc.needListingRefresh = true;
      this.navCtrl.navigateRoot('/seller')
    })
  }
}
