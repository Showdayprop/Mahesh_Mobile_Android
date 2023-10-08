import { SharedModule } from './../../shared/shared.module';
import { ServiceComponent } from './service/service.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AffiliateProviderPageRoutingModule } from './affiliate-provider-routing.module';

import { AffiliateProviderPage } from './affiliate-provider.page';
import { IonicSelectableModule } from 'ionic-selectable';
import { ServiceData } from '../../resolvers/service-data';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    AffiliateProviderPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AffiliateProviderPage,
    ServiceComponent],
  providers: [ServiceData]
})
export class AffiliateProviderPageModule { }
