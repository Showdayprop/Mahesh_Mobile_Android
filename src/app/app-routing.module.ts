import { CaptureMobileComponent } from './components/capture-mobile/capture-mobile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AlertPreferences } from './resolvers/alert-preferences';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: '/dashboard/categories',
    pathMatch: 'full'
  },
  { path: 'walkthrough', loadChildren: () => import('./pages/walkthrough/walkthrough.module').then(m => m.WalkthroughPageModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'login', loadChildren: () => import('./pages/authentication/authentication.module').then(m => m.AuthenticationPageModule) },
  {
    path: 'property-filters', loadChildren: () => import('./pages/property-filters/property-filters.module')
      .then(m => m.PropertyFiltersModule)
  },
  { path: 'property-detail', loadChildren: () => import('./pages/property-map/property-map.module').then(m => m.PropertyMapModule) },
  { path: 'settings', loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule) },
  {
    path: 'edit-profile',
    component: EditProfileComponent
  },
  {
    path: 'seller',
    loadChildren: () => import('./pages/seller/seller.module').then(m => m.SellerPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  {
    path: 'alerts-filters',
    loadChildren: () => import('./pages/property-filters/property-filters.module').then(m => m.PropertyFiltersModule),
    resolve: { data: AlertPreferences }
  },
  {
    path: 'calculators',
    loadChildren: () => import('./pages/calculators/calculators.module').then(m => m.CalculatorsPageModule)
  },
  {
    path: 'favourites',
    loadChildren: () => import('./pages/favourites/favourites.module').then(m => m.FavouritesPageModule)
  },
  {
    path: 'booking',
    loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingModule)
  },
  {
    path: 'device-logs',
    loadChildren: () => import('./pages/device-logs/device-logs.module').then(m => m.DeviceLogsPageModule)
  },
  {
    path: 'property-tour',
    loadChildren: () => import('./pages/property-tour/property-tour.module').then(m => m.PropertyTourPageModule)
  },
  {
    path: 'property-video',
    loadChildren: () => import('./pages/property-video/property-video.module').then(m => m.PropertyVideoPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'affiliate-provider',
    loadChildren: () => import('./pages/affiliate-provider/affiliate-provider.module').then(m => m.AffiliateProviderPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers:'always'
  },
  {
    path: 'capture-mobile',
    component: CaptureMobileComponent
  },
  {
    path: 'tracker',
    loadChildren: () => import('./pages/tracker/tracker.module').then( m => m.TrackerPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
