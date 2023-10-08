import { SharedModule } from './../../shared/shared.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { MaterialModule } from '../../material.module';

import { IonicModule } from '@ionic/angular';

import { PropertyFiltersPage } from './property-filters';

const routes: Routes = [
  {
    path: '',
    component: PropertyFiltersPage
  }
];
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    NgxMaskModule.forRoot(options),
    SharedModule
  ],
  entryComponents:[],
  declarations: [PropertyFiltersPage],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class PropertyFiltersModule { }
