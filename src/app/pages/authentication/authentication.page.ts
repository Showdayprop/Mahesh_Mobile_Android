import { ChatService } from './../../providers/chat.service';
import { ActivatedRoute } from '@angular/router';
import { PropertiesService } from './../../providers/properties.service';
import { LoggerService } from './../../core/logger.service';
import { SupportService } from './../../providers/support.service';
import { StorageService } from './../../providers/storage.service';
import { UserManagementService } from './../../providers/user-management.service';
import { Common } from './../../shared/common';
import { GlobalConfigService } from './../../providers/global-config.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController, MenuController, ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { UtilityService } from '../../providers/utilities.service';
import { AuthenticationService } from '../../providers/authentication.service';
import { Plugins } from '@capacitor/core';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';
import { environment } from '../../../environments/environment';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import '@codetrix-studio/capacitor-google-auth';
import { User } from '@codetrix-studio/capacitor-google-auth/dist/esm/user';

const { Storage, Haptics, Browser } = Plugins;

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {
  onLoginForm: FormGroup;
  onRegisterForm: FormGroup;
  // tslint:disable-next-line: ban-types
  authSegment: String = 'login';
  deviceInfo: {};
  hide = true;
  lgnHide = true;
  deviceId: any;
  locationData: any;
  userData: any;
  public version;
  functionalTypes;
  agentCode;
  queryParam;
  serviceProviderRegisterForm: FormGroup;
  isProvider = true;
  authError;
  hasError;
  SocialIdResult;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private utilityService: UtilityService,
    private common: Common,
    private globalConfigSrvc: GlobalConfigService,
    private userMgmtSrvc: UserManagementService,
    private storageSrvc: StorageService,
    private supportSrvc: SupportService,
    private logger: LoggerService,
    private propertiesSrvc: PropertiesService,
    private activatedRoute: ActivatedRoute,
  private chatSrvc:ChatService,
    private afAuth: AngularFireAuth,
    private ngZone: NgZone,
    private signInWithApple: SignInWithApple,
    private platform: Platform,
    private googlePlus: GooglePlus,
    private fb: Facebook,
  ) {
    this.queryParam = this.activatedRoute.snapshot.queryParams.page
    this.userData = this.userMgmtSrvc.user.getValue();
  }

  ngOnInit() {
    this.menuCtrl.enable(false)
    this.locationData = this.utilityService.getLocationData();
    this.utilityService.getFunctionalTypes().toPromise().then((res: any) => {
      this.functionalTypes = res
      this.agentCode = res.find(el => el.f_name == 'Agent').f_id
      this.utilityService.functionalTypes = this.functionalTypes
    })
    this.onLoginForm = this.formBuilder.group({
      login_username: [null, Validators.compose([
        Validators.required
      ])],
      password: [null, Validators.compose([
        Validators.required
      ])]
    });

    this.onRegisterForm = this.formBuilder.group({
      first_name: ["", Validators.compose([
        Validators.required,
        Validators.minLength(3)
      ])],
      surname: [""],
      email_address: [null, Validators.compose([
        // Validators.required,
        Validators.email
      ])],
      mobile_number: [null, Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ])],
      selected_roles: [["1", "6"], Validators.compose([
        Validators.required
      ])],
      login_id: [null, Validators.compose([
        Validators.required
      ])],
      password: [null, Validators.compose([
        Validators.required,
        Validators.minLength(5)
      ])],
      message: [null],
      accept_terms: [false, Validators.compose([
        Validators.required
      ])]
    });
    this.serviceProviderRegisterForm = this.formBuilder.group({
      first_name: [null, Validators.compose([
        Validators.required,
        Validators.minLength(3)
      ])],
      surname: [null],
      providerName: [null],
      aboutProvider: [null],
      mobile_number: [null, Validators.compose([
        Validators.required,
        Validators.minLength(10)
      ])],
      email_address: [null, Validators.compose([
        Validators.email
      ])],
      selected_roles: ['6', Validators.compose([
        Validators.required
      ])],
      login_id: [null, Validators.compose([
        Validators.required
      ])],
      password: [null, Validators.compose([
        Validators.required,
        Validators.minLength(5)
      ])],
      accept_terms: [false, Validators.compose([
        Validators.required
      ])]
    });
    // this.onRegisterForm.get('mobile_number').valueChanges.subscribe(r=>{
    //   debugger
    // })
    this.version = this.globalConfigSrvc.deviceInfo.appVersion
  }

  ionViewDidEnter() {
    this.common.presentToast('Note : To Sign-In quicker, you may also use your social login','',6000)
  }
  get getLoginForm() { return this.onLoginForm.controls; }

  get getSignupForm() { return this.onRegisterForm.controls; }

  doLogin() {
    const deviceId = this.globalConfigSrvc.deviceInfo.uuid;

    this.common.presentLoader()

    this.authService.processLogin(
      this.onLoginForm.value.login_username,
      this.onLoginForm.value.password,
      deviceId
    ).toPromise().then(response => {
      // await Storage.remove({
      //   key: 'sd_token'
      // });

      // await Storage.set({
      //   key: 'sd_token',
      //   value: response
      // });
      this.logger.setDeviceKey(this.onLoginForm.value.login_username);
      this.userData['authToken'] = response;
      this.globalConfigSrvc.authToken = response;
      this.authService.getMe().toPromise().then(me => {
        // const appSettings = await Storage.get({key: 'app_settings_' + me.id});
        // const tempAppSettings = appSettings.value ? JSON.parse(appSettings.value) : {};

        //get user favs
        this.propertiesSrvc.getUserFavsIds()

        //check for existing user data in storage, specifically for roles
        this.storageSrvc.getObject('userInfo_' + me.id).then(data => {
          if (data && data.email_address == me.email_address && data.myRoles) {
            this.userData.myRoles = data.myRoles
          }
          if (me.roles && me.roles.length > 0) {
            this.userData.myRoles = me.roles.map(el => el.functional_type)
            delete me.roles
          }
          this.userData = { ...this.userData, ...me }
          this.userData['isLoggedIn'] = true;
          this.userMgmtSrvc.updateUser(this.userData)
          this.chatSrvc.startSocketConnection();
          if (this.userData.myRoles) {
            this.userMgmtSrvc.initUserSettings()
            // this.navCtrl.navigateRoot('/home')
            /* if (this.userData.account_type == "affiliate") {
              this.navCtrl.navigateRoot('/affiliate-provider')
            }
            else  */
            this.navCtrl.navigateRoot('/dashboard/categories')
          } else {
            //This condition should not occur, check if this console log appears
            console.log('Error :: User role not found in user data object')
          }
          this.common.dismissLoader()
        })
      });
    }, (err) => {
      this.common.dismissLoader()
      Haptics.vibrate();
      this.common.presentToast('Invalid login credentials.', undefined, 3000, 'danger', true)
    });
  }

  openAppleSignIn() {
    this.logger.log("openAppleSignIn")
    this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    })
      .then((res: AppleSignInResponse) => {
        this.logger.log("openAppleSignIn : " + res)
        let provider = new firebase.auth.OAuthProvider('apple.com');
        const cred = provider.credential({ idToken: res.identityToken })

        this.afAuth.auth.signInWithCredential(cred)
          .then(result => {
            this.logger.log("openAppleSignIn : " + result)
            this.SocialIdResult = result;
            this.getSocialIdToken(result);
          })
          .catch(error => {
            this.logger.log("signInWithCredential error : " + error)
            this.catchSocialError(error)
          });
      })
      .catch((error: AppleSignInErrorResponse) => {
        this.logger.log("AppleSignInErrorResponse error : " + JSON.stringify(error))
        this.logger.log("AppleSignInErrorResponse error : " + error.error)
        this.common.presentPopupAlertForOK(error.localizedDescription, "Apple SignIn Failed");
        console.error(error.error);
      });
  }

  signInSocialMedia(name) {
    try {
      let provider;
      this.common.presentLoader();
      if ((this.platform.is('android') || this.platform.is('ios')) && !this.platform.is('mobileweb')) {
        if (name == "Google") {
          provider = new firebase.auth.GoogleAuthProvider();
          Plugins.GoogleAuth.signIn().then(
            (res: User) => {
              console.log("Res : " + res)
              this.afAuth.auth.signInWithCredential(provider.credential(res.authentication.idToken))
                .then(result => {
                  console.log("Result : " + result)
                  this.SocialIdResult = result;
                  this.getSocialIdToken(result);
                },
                  error => {
                    this.common.dismissLoader();
                    console.log(error);
                    this.catchSocialError(error)
                  }
                )
            },
            err => {
              console.log(err)
              this.common.dismissLoader();
            }
          )
        } else if (name == "Facebook") {
          provider = new firebase.auth.FacebookAuthProvider();
          this.fb.login(['public_profile', 'email']).then(
            (res: FacebookLoginResponse) => {
              console.log("Res : " + res)
              this.afAuth.auth.signInWithCredential(provider.credential({ accessToken: res.authResponse.accessToken }))
                .then(result => {
                  console.log("Result : " + result)
                  this.SocialIdResult = result;
                  this.getSocialIdToken(result);
                },
                  error => {
                    this.common.dismissLoader();
                    console.log(error);
                    this.catchSocialError(error)
                  }
                )
            },
            err => {
              console.log(err)
              this.common.dismissLoader();
            }
          )
        }
      } else {
        if (name == "Google") {
          provider = new firebase.auth.GoogleAuthProvider();
        } else if (name == "Facebook") {
          provider = new firebase.auth.FacebookAuthProvider();
        }
        this.afAuth.auth.signInWithPopup(provider)
          .then(result => {
            this.SocialIdResult = result;
            this.getSocialIdToken(result);
          })
          .catch(error => {
            this.common.dismissLoader();
            console.log(error);
            this.catchSocialError(error)
          });
      }
    } catch (error) {
      console.log(error)
    };
  }

  handleProviderMismatch(provider) {
    const options = {
      title: 'Confirm',
      message: 'An account already exists with the same email address but different sign-in credentials. Do you want to use the alternative option?',
      cancelText: 'No',
      confirmText: 'Yes'
    };
    this.common.presentAlertForConfirmation(options.message, options.title, options.confirmText, options.cancelText).then(
      res => {
        if (res) {
          this.common.presentLoader();
          this.afAuth.auth.signInWithPopup(provider)
            .then(result => {
              this.getSocialIdToken(result);
            }).catch(err => {
              this.catchSocialError(err)
            })
        }
      }
    )
  }
  getSocialIdToken(result) {
    result.user.getIdToken(false).then(
      idToken => {
        this.logger.log(idToken)
        idToken = idToken;

        const loginSubscr = this.authService
          .loginwsm(idToken, this.globalConfigSrvc.deviceInfo.uuid)
          .subscribe(
            (response) => {
              this.logger.log(response)
              console.log(response)
              this.logger.setDeviceKey(this.onLoginForm.value.login_username);
              this.userData['authToken'] = response;
              this.globalConfigSrvc.authToken = response;
              this.authService.getMe().toPromise().then(me => {

                //get user favs
                this.propertiesSrvc.getUserFavsIds()

                //check for existing user data in storage, specifically for roles
                this.storageSrvc.getObject('userInfo_' + me.id).then(data => {
                  if (data && data.email_address == me.email_address && data.myRoles) {
                    this.userData.myRoles = data.myRoles
                  }
                  if (me.roles && me.roles.length > 0) {
                    this.userData.myRoles = me.roles.map(el => el.functional_type)
                    delete me.roles
                  }
                  this.userData = { ...this.userData, ...me }
                  this.userData['isLoggedIn'] = true;
                  this.userMgmtSrvc.updateUser(this.userData)
                  if (this.userData.myRoles) {
                    this.userMgmtSrvc.initUserSettings()
                    this.navCtrl.navigateRoot('/dashboard/categories')
                  } else {
                    //This condition should not occur, check if this console log appears
                    console.log('Error :: User role not found in user data object')
                  }
                  this.common.dismissLoader()
                })
              });
            },
            error => {
              this.common.dismissLoader()
              this.logger.log(error)
              console.log(error);
              if (error.uid) {
                this.ngZone.run(
                  () => {
                    this.authSegment = 'register';
                    if (error.displayName) {
                      this.onRegisterForm.get('first_name').setValue(error.displayName.toString().substring(0, error.displayName.toString().indexOf(" ")))
                      this.onRegisterForm.get('surname').setValue(error.displayName.toString().substring(error.displayName.toString().indexOf(" ") + 1))
                    }
                    if (error.email) {
                      this.onRegisterForm.get('email_address').setValue(error.email)
                    }
                    if (error.phoneNumber) {
                      this.onRegisterForm.get('mobile_number').setValue(error.phoneNumber)
                    }

                    this.onRegisterForm.get('login_id').clearValidators();
                    this.onRegisterForm.get('login_id').disable();
                    this.onRegisterForm.get('password').clearValidators();
                    this.onRegisterForm.get('password').disable();
                    this.onRegisterForm.updateValueAndValidity();
                  }
                )
              }
            });
      });
  }

  catchSocialError(error) {
    this.logger.log(error)
    setTimeout(() => {
      this.ngZone.run(async () => {
        this.common.dismissLoader();
      })
    })
    this.hasError = true;
    console.log(error);
    if (error.code === "auth/account-exists-with-different-credential") {
      this.common.presentToast('An account already exists with the same email address but different sign-in credentials. Please use the alternative options.');
    } else if (error.code === "auth/network-request-failed") {
      this.common.presentToast('You do not have active internet connection!!!');
    } else if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
      this.common.presentToast('Username or Password is incorrect');
    } else if (error.code === "auth/user-disabled") {
      this.common.presentToast('Your account has been disabled');
    } else if (error.code === "auth/too-many-requests") {
      this.common.presentToast('Access to this account has been temporarily disabled. Please try after sometime.');
    } else {
      this.common.presentToast('Something went wrong');
    }
  }

  doSignup() {
    const deviceId = this.globalConfigSrvc.deviceInfo.uuid;
    if (this.onRegisterForm.value.selected_roles.includes(this.agentCode)) {
      //user has selected agent as role, send the details to admin
      let roleNames = this.functionalTypes.filter(el => {
        return this.onRegisterForm.value.selected_roles.includes(el.f_id)
      }).map(ele => ele.f_name).join(', ')
      let dataObj = {
        "first_name": this.onRegisterForm.value.first_name,
        "surname": this.onRegisterForm.value.surname,
        "email_address": this.onRegisterForm.value.email_address,
        "mobile_number": this.onRegisterForm.value.mobile_number,
        "message": this.onRegisterForm.value.message,
        "roles": roleNames,
      }
      this.common.presentLoader();
      this.supportSrvc.requestAdminForAccess(dataObj).toPromise().then((res: any) => {
        // debugger
        console.log(res)
        this.common.presentToast('Your request has been sent to the Admin. You will be contacted shortly.!')
      }).catch(err => {
        console.log(err)
        this.common.presentToast('Unable to send request. Please contact App support.!')
      }).finally(() => {
        this.common.dismissLoader()
      })
    }
    else {
      if (!this.onRegisterForm.value.accept_terms) {
        Haptics.vibrate();
        this.common.presentToast('You have to accept the terms of service to complete the signup.', undefined, 3000, 'danger', true)
        return;
      }
      if (!this.isProvider) {
        //remove service provider role
        let filt = this.onRegisterForm.controls.selected_roles.value.filter(el => el != "6")
        this.onRegisterForm.controls.selected_roles.setValue(filt)
      }
      const terms = 'Y';
      this.common.presentLoader()

      let loginsm = false;
      if (this.SocialIdResult) {
        loginsm = true
      }
      this.authService.processSignup(
        this.onRegisterForm.value.first_name,
        this.onRegisterForm.value.surname,
        this.onRegisterForm.value.email_address,
        this.onRegisterForm.value.mobile_number,
        this.onRegisterForm.value.login_id,
        this.onRegisterForm.value.password,
        deviceId,
        this.locationData && this.locationData.countryCode ? this.locationData.countryCode : 'za',
        terms,
        this.isProvider ? 'affiliate' : 'individual',
        this.onRegisterForm.value.selected_roles,
        loginsm
      ).toPromise().then((response) => {
        // this.common.dismissLoader()
        if (this.SocialIdResult) {
          this.getSocialIdToken(this.SocialIdResult);
        } else {
          this.autoSignIn(this.onRegisterForm.value.login_id, this.onRegisterForm.value.password);
        }
        this.onRegisterForm.reset();
        // this.common.presentToast(response.message, undefined, 3000, 'success', true)
        // this.authSegment = 'login';
      }, (err) => {
        this.common.dismissLoader()
        Haptics.vibrate();
        this.common.presentToast(err, undefined, 3000, 'danger', true)
      });
    }
  }

  doProviderSignup() {
    if (!this.serviceProviderRegisterForm.value.accept_terms) {
      Haptics.vibrate();
      this.common.presentToast('You have to accept the terms of service to complete the signup.', undefined, 3000, 'danger', true)
      return;
    }
    this.common.presentLoader();
    let data = {
      ...this.serviceProviderRegisterForm.value,
      device_id: this.globalConfigSrvc.deviceInfo.uuid,
    }
    this.authService.serviceProviderSignup(data).toPromise().then((response: any) => {
      // this.common.dismissLoader()
      this.serviceProviderRegisterForm.reset();
      this.autoSignIn(data['login_id'], data['password']);
    }, (err) => {
      this.common.dismissLoader()
      Haptics.vibrate();
      this.common.presentToast(err.error?err.error:err, undefined, 3000, 'danger', true)
    });
  }

  autoSignIn(login_id, pass) {
    this.authService.processLogin(
      login_id, pass,
      this.globalConfigSrvc.deviceInfo.uuid
    ).toPromise().then(response => {
      this.logger.setDeviceKey(login_id);
      this.userData['authToken'] = response;
      this.globalConfigSrvc.authToken = response;
      this.authService.getMe().toPromise().then(me => {
        //check for existing user data in storage, specifically for roles
        this.storageSrvc.getObject('userInfo_' + me.id).then(data => {
          if (data && data.myRoles) {
            this.userData.myRoles = data.myRoles
          }
          if (me.roles && me.roles.length > 0) {
            this.userData.myRoles = me.roles.map(el => el.functional_type)
            delete me.roles
          }
          this.userData = { ...this.userData, ...me }
          this.userData['isLoggedIn'] = true;
          this.userMgmtSrvc.updateUser(this.userData)
          this.chatSrvc.startSocketConnection();
          this.common.dismissLoader()
          this.common.presentToast('Logged In Successfully', undefined, 3000, 'success', true)
          if (this.isProvider) {
            //navigate to additional info
            this.navCtrl.navigateForward(['/edit-profile'], { queryParams: { page: 'signup' } })
          }
          else {
            this.navCtrl.navigateRoot('/dashboard/categories')
          }
        })
      });
    }, (err) => {
      this.common.dismissLoader()
      Haptics.vibrate();
      this.common.presentToast('Unable to Login. Contact Support.', undefined, 3000, 'danger', true)
    });
  }
  async displayTermsConditions() {
    await Browser.open({ url: 'https://www.showday.com/generic-privacy-policy' });
  }
  goToLaunch() {
    this.userMgmtSrvc.removeUserDataOnLogout();
    this.navCtrl.navigateRoot('/')
  }
  async forgotPass() {

  }
  userRolesUpdated(event) {
    if (this.onRegisterForm.value.selected_roles.includes(this.agentCode)) {
      this.onRegisterForm.get('login_id').setValidators(null);
      this.onRegisterForm.get('password').setValidators(null);
      this.onRegisterForm.get('accept_terms').setValidators(null);
    }
    else {
      this.onRegisterForm.get('login_id').setValidators([Validators.required]);
      this.onRegisterForm.get('password').setValidators([Validators.required,
      Validators.minLength(6)]);
      this.onRegisterForm.get('accept_terms').setValidators([Validators.required]);
    }
    this.onRegisterForm.get('login_id').updateValueAndValidity();
    this.onRegisterForm.get('password').updateValueAndValidity();
    this.onRegisterForm.get('accept_terms').updateValueAndValidity();
  }
  test() {
    let dataObj = {
      email_address: "Asd@asd.com",
      first_name: "Asda",
      message: "asdas",
      mobile_number: "1231231231",
      roles: "Buyer, Agent",
      surname: "asdas"
    }

    this.supportSrvc.requestAdminForAccess(dataObj).toPromise().then(res => {
      alert(JSON.stringify(res))
    }).catch(err => {
      alert(JSON.stringify(err))
    })

  }
  skip() {
    // this.navCtrl.navigateRoot('/home')
    this.navCtrl.navigateRoot('/dashboard/categories')
  }

  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Retrieve Password',
      message: 'Enter your Login ID or Registered Email Id. Your password will be emailed to you.!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Submit',
          handler: (data) => {
            console.log(data.fw_login_id);
            this.common.presentLoader();
            this.authService.forgotPassword({ fw_login_id: data.fw_login_id }).toPromise().then((res: any) => {
              if (res.toLowerCase() == "success") {
                this.common.presentToast('Password sent to registered email.', null, null, 'success')
              }
              else {
                this.common.presentToast('Unable to retrieve password. Please contact support team')
              }
            }).catch(err => {
              console.log(err)
              this.common.presentToast('Unable to retrieve password. Please contact support team')
            }).finally(() => {
              this.common.dismissLoader()
            })
          }
        }
      ],
      inputs: [
        {
          name: 'fw_login_id',
          id: 'fw_login_id',
          type: 'text',
          placeholder: 'Login ID / Email ID'
        }
      ]
    });

    await alert.present();
  }

  serviceProviderCheckBox(event) {
    let status = event.checked;
    if (status) {
      this.onRegisterForm.get('email_address').setValidators([
        Validators.email
      ]);
    }
    else {
      this.onRegisterForm.get('email_address').setValidators([
        Validators.required,
        Validators.email
      ]);
    }
    this.onRegisterForm.get('email_address').updateValueAndValidity();
  }
  ngOnDestroy() {
    this.menuCtrl.enable(true)
  }
}
