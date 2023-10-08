import { UploadCoordinatesComponent } from '../uploadCoordinates/uploadCoordinates.component';
import { UploadImageComponent } from './uploadImage/uploadImage.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddUrlPage } from './add-url.page';

const routes: Routes = [
  {
    path: '',
    component: AddUrlPage
  },
  {
    path:'upload-image',
    component:UploadImageComponent
  },
  {
    path:'upload-coordinates',
    component:UploadCoordinatesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddUrlPageRoutingModule {}
