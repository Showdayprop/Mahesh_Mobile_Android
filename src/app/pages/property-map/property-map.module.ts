import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PropertyMapPage } from './property-map';
import { ReplaceTagsPipe } from '../../pipes/replace-tags.pipe';

const routes: Routes = [
  {
    path: '',
    component: PropertyMapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [PropertyMapPage,ReplaceTagsPipe],
  providers:[ReplaceTagsPipe]
})

export class PropertyMapModule { }
