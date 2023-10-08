import { UserManagementService } from './../../providers/user-management.service';
import { StorageService } from './../../providers/storage.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-capture-mobile',
  templateUrl: './capture-mobile.component.html',
  styleUrls: ['./capture-mobile.component.scss'],
})
export class CaptureMobileComponent implements OnInit {
  number: string;
  userData;
  constructor(private storageSrvc: StorageService,
    private userMgmtSrvc: UserManagementService) {
    this.userData = this.userMgmtSrvc.user.getValue();
   }

  proceed() {
    this.userData['contact_number'] = this.number;
    this.userMgmtSrvc.updateUser(this.userData);
    this.storageSrvc.setItem('contact_number', this.number)
  }
  ngOnInit() {}

}
