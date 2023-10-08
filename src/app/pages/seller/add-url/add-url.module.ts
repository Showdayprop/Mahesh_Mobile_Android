import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddUrlPageRoutingModule } from './add-url-routing.module';

import { AddUrlPage } from './add-url.page';
import { UploadImageComponent } from './uploadImage/uploadImage.component';

@NgModule({
  entryComponents:[UploadImageComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddUrlPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [AddUrlPage,UploadImageComponent]
})
export class AddUrlPageModule {}
