import { SharedModule } from './../../shared/shared.module';
import { MaterialModule } from './../../material.module';
import { EstateSearchComponent } from './../../components/estate-search/estate-search.component';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { GlobalSearchService } from './../../providers/global-search.service';
import { FullSearchComponent } from './../../components/full-search/full-search.component';
import { DashboardComponent } from './dashboard.component';
import { CategoriesComponent } from './categories/categories.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { ScrollVanishDirective } from '../../directives/scroll-vanish.directive';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MaterialModule,
    SharedModule,
    IonicSelectableModule
  ],
  entryComponents: [EstateSearchComponent],
  declarations: [DashboardComponent,
    CategoriesComponent,
    FullSearchComponent,
    ProvidersListComponent,
    ScrollVanishDirective,
    EstateSearchComponent
  ],
  providers: [GlobalSearchService]
})
export class DashboardPageModule { }
