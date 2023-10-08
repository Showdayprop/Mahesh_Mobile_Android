import { CaptureMobileComponent } from './components/capture-mobile/capture-mobile.component';
import { TrackerService } from './providers/tracker.service';
import { AuthGuard } from './core/guards/auth.guard';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { DirectoryService } from './providers/directory.service';
import { RouterHelperService } from './providers/router-helper.service';
import { BookingService } from './providers/booking.service';
import { EventsService } from './providers/events.service';
import { AlertPreferences } from './resolvers/alert-preferences';
import { NotificationService } from './providers/notification.service';
import { FileService } from './providers/file.service';
import { CameraHelperService } from './providers/camera-helper.service';
import { SupportService } from './providers/support.service';
import { ResponseInterceptor } from './core/response.interceptor';
import { LoggerService } from './core/logger.service';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { SharedModule } from './shared/shared.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
// import { AgmCoreModule } from '@agm/core';
import { IonicStorageModule } from '@ionic/storage';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { SupportDetailComponent } from './components/support-detail/support-detail.component';
import { AgentContactDetailComponent } from './components/agent-contact-detail/agent-contact-detail.component';

import { AppRoutingModule } from './app-routing.module';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { KeyInterceptor } from './core/key.interceptor';

// Modal Pages
import { ImagePageModule } from './pages/modal/image/image.module';
import { LocationPageModule } from './pages/modal/location/location.module';
import { UserManagementService } from './providers/user-management.service';
import { UtilityService } from './providers/utilities.service';
import { AuthenticationService } from './providers/authentication.service';
import { GlobalConfigService } from './providers/global-config.service';
import { PropertiesService } from './providers/properties.service';
import { StorageService } from './providers/storage.service';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { Market } from '@ionic-native/market/ngx';
import { ChatService } from './providers/chat.service';
// import { HTTP } from '@ionic-native/http/ngx';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Deploy } from 'cordova-plugin-ionic/dist/ngx';


@NgModule({
  declarations: [
    AppComponent,
    SupportDetailComponent,
    AgentContactDetailComponent,
    EditProfileComponent,
    CaptureMobileComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(environment.config),
    AppRoutingModule,
    HttpClientModule,
    ImagePageModule,
    LocationPageModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    IonicStorageModule.forRoot({
      name: '__sd_storage',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyBnTnX1cVqp8AbMAL6TNL50WV8pKPI6t7Q'
    // }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    SharedModule,
    IonicSelectableModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeyInterceptor,
      multi: true
    },
    environment.loggingEnabled ? [{
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true
    }] : [],
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    LaunchNavigator,
    CallNumber,
    Geolocation,
    UserManagementService,
    UtilityService,
    AuthenticationService,
    GlobalConfigService,
    PropertiesService,
    StorageService,
    NativeGeocoder,
    LoggerService,
    SupportService,
    CameraHelperService,
    FileService,
    FileTransfer,
    FileTransferObject,
    InAppBrowser,
    NotificationService,
    FirebaseDynamicLinks,
    AlertPreferences,
    EventsService,
    BookingService,
    Market,
    RouterHelperService,
    DirectoryService,
    ImagePicker,
    ChatService,
    AuthGuard,
    SignInWithApple,
    GooglePlus,
    Facebook,
    Deploy,
    TrackerService
  ],
  bootstrap: [AppComponent],
  entryComponents: [SupportDetailComponent, AgentContactDetailComponent]
})
export class AppModule { }
