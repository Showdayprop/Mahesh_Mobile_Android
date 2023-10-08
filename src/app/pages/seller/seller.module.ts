import { LiveComponent } from './live/live.component';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SellerPageRoutingModule } from './seller-routing.module';

import { SellerPage } from './seller.page';
import { DraftComponent } from './draft/draft.component';

@NgModule({
  entryComponents: [LiveComponent, DraftComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SellerPageRoutingModule,
    SharedModule
  ],
  declarations: [SellerPage,
    LiveComponent,
    DraftComponent]
})
export class SellerPageModule { }
