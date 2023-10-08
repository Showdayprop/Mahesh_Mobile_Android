import { ImageUploadComponent } from './../../components/image-upload/image-upload.component';
import { ServiceComponent } from './service/service.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AffiliateProviderPage } from './affiliate-provider.page';
import { UploadCoordinatesComponent } from '../seller/uploadCoordinates/uploadCoordinates.component';
import { ServiceData } from '../../resolvers/service-data';

const routes: Routes = [
  {
    path: '',
    component: AffiliateProviderPage
  },
  {
    path: 'service',
    component: ServiceComponent,
    resolve: { data: ServiceData }
  },
  {
    path: 'upload-coordinates',
    component: UploadCoordinatesComponent
  },
  {
    path: 'upload-images',
    component: ImageUploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AffiliateProviderPageRoutingModule { }
