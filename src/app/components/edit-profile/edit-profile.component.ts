import { ActivatedRoute } from '@angular/router';
import { UtilityService } from './../../providers/utilities.service';
import { AuthenticationService } from './../../providers/authentication.service';
import { NavController } from '@ionic/angular';
import { Common } from './../../shared/common';
import { UserManagementService } from './../../providers/user-management.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {

  userData;
  myRoles;
  isSeller: boolean;
  changePasswordForm: FormGroup;
  profileForm: FormGroup;
  statesConfig;
  citiesConfig: any;
  preSelectedCityName;
  queryParam: any;
  constructor(private userMgmtSrvc: UserManagementService,
    private common: Common,
    public formBuilder: FormBuilder,
    private navCtrl: NavController,
    private authSrvc: AuthenticationService,
    private utilitySrvc: UtilityService,
    private activatedRoute: ActivatedRoute) {
    this.queryParam = this.activatedRoute.snapshot.queryParams.page;
    this.utilitySrvc.getStatesByCountry('za').toPromise().then(res => {
      this.statesConfig = res
    })
    this.userData = this.userMgmtSrvc.user.getValue()
    this.myRoles = [...this.userData.myRoles];
  }

  ngOnInit() {

    this.changePasswordForm = this.formBuilder.group({
      currentPass: ['', Validators.compose([
        Validators.required])],
      newPass: ['', Validators.compose([
        Validators.required])],
      confirmPass: ['', Validators.compose([
        Validators.required])],
    });

    this.profileForm = this.formBuilder.group({
      first_name: [null, Validators.compose([
        Validators.required,
        Validators.minLength(3)
      ])],
      surname: [null],
      email_address: [null, Validators.compose([
        Validators.email
      ])],
      contact_number: [null, Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10)
      ])],
      state_id: [null],
      city_id: [{ value: null, disabled: true }],
      address: [null],
      isCompany: [false],
      affiliate_name: [null],
      about_me: [null],
      vat_number: [null]
    })
    this.prePopulateData();
  }

  prePopulateData() {
    this.common.presentLoader();
    this.authSrvc.getProfile().toPromise().then(res => {
      if (res) {
        this.profileForm.patchValue(res)
        this.preSelectedCityName = res['city_name']
        this.profileForm.controls.isCompany.setValue(res['isCompany'] == "1")
        let aff_name = res['affiliate_name'] ? res['affiliate_name'] : (res['first_name'] + (res['surname'] && res['surname'] != "null" ? " " + res['surname'] : ""))
        this.profileForm.controls.affiliate_name.setValue(aff_name)
        if (res['state_id']) {
          this.profileForm.controls.city_id.enable();
          if (!res['city_id'] || res['city_id'] == "null" || !res['city_name']) {
            this.getCities(res['state_id'])
          }
        }
      }
      this.common.dismissLoader();
    }).catch(err => {
      console.log(err)
      this.common.dismissLoader()
    })
  }
  roleOptionChecked(event) {
    if (event.target.checked) {
      if (event.target.value == "sell") {
        this.isSeller = true;
        this.myRoles.push('2');
        this.myRoles.push('3')
        this.myRoles.push('5')
      }
      else {
        this.myRoles.push(event.target.value)
      }
    }
    else {
      if (event.target.value == "sell") {
        this.isSeller = false;
        this.myRoles = this.myRoles.filter(el => el != "2" && el != "3" && el != "5")
      }
      else {
        this.myRoles = this.myRoles.filter(el => el != event.target.value)
      }
    }
  }
  checkForUpdates(): boolean {
    if (!this.myRoles || this.myRoles.length == 0) {
      return true
    }
    return JSON.stringify(this.myRoles) == JSON.stringify(this.userData.myRoles)
  }
  saveChanges() {
    if ((this.myRoles.indexOf("2") > -1 || this.myRoles.indexOf("3") > -1) && !this.userData.isLoggedIn) {
      //user has selected seller role, prompt for registration
      this.common.presentAlertForConfirmation('Sellers or Landlords or Agents are required to be registered. Confirm to Login / Sign Up', 'Login required', 'Confirm').then(res => {
        //user has confirmed. update roles and take to login screen
        this.updateUserRoles();
        this.navCtrl.navigateRoot('login')
      }).catch(err => {
        //user has rejected, remove the seller roles and stay on the page
        this.isSeller = false;
        this.myRoles = this.myRoles.filter(el => el != "2" && el != "3" && el != "5")
      })
    }
    else {
      //no seller role selected or the user is already logged in, update and save
      this.updateUserRoles();
      // this.navCtrl.navigateBack('home');
      this.navCtrl.navigateRoot('/dashboard/categories')
    }
  }

  updateUserRoles() {
    this.userData.myRoles = [...this.myRoles]
    this.userMgmtSrvc.updateUser(this.userData);
    this.authSrvc.updateUserRoles({ roles: this.userData.myRoles }).toPromise().then(res => {
      if (res == "Success") {
        this.common.presentToast('Roles have been updated')
      }
    })
  }

  disableUpdatePassButton(): boolean {
    if (this.changePasswordForm.invalid) {
      return true;
    }
    else if (this.changePasswordForm.value.newPass != this.changePasswordForm.value.confirmPass) {
      return true
    }
    else {
      return false;
    }
  }
  updatePassword() {
    this.common.presentLoader();
    this.authSrvc.updatePassword(this.changePasswordForm.value).toPromise().then(res => {
      console.log(res)
      if (res == 'success') {
        this.common.presentToast('Password has been updated successfully.!')
      }
      else {
        this.common.presentToast(res)
      }
    }).catch(err => {
      console.log(err)
      this.common.presentToast('Server response error. Contact support team.!')
    }).finally(() => {
      this.common.dismissLoader()
    })
  }

  getCities(value) {
    this.utilitySrvc.getCities(value).toPromise().then(cities => {
      this.citiesConfig = cities
      this.profileForm.controls.city_id.enable();
    })
  }

  saveProfile(skip?) {
    this.common.presentLoader();
    // this.profileForm.value['account_type'] = "affiliate";
    this.authSrvc.updateUserInfo(this.profileForm.value).toPromise().then(res => {
      if (res) {
        this.userData['contact_number'] = this.profileForm.value['contact_number']
        this.userData['email_address'] = this.profileForm.value['email_address']
        this.userData['first_name'] = this.profileForm.value['first_name']
        this.userData['surname'] = this.profileForm.value['surname']
        this.userData['account_type'] = this.profileForm.value['account_type']
        this.userData['isCompany'] = this.profileForm.value['isCompany'] ? "1" : "0"
        this.userMgmtSrvc.updateUser(this.userData);
        if (this.queryParam && this.queryParam == 'signup') {
          if (!skip) {
            this.common.presentToast('Profile updated successfully')
          }
          this.navCtrl.navigateRoot('/affiliate-provider')
        }
        else {
          this.common.presentToast('Profile updated successfully')
          this.navCtrl.navigateRoot('/')
        }
      }
    }).catch((err) => console.log(err)).finally(() => this.common.dismissLoader())
  }
}
