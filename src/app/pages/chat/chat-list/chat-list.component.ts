import { Subscription } from 'rxjs';
import { NotificationService } from './../../../providers/notification.service';
import { ChatDetailComponent } from './../chat-detail/chat-detail.component';
import { UserManagementService } from './../../../providers/user-management.service';
import { Common } from './../../../shared/common';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { ChatService } from '../../../providers/chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent implements OnInit {
  roomsList;
  isLoading = false;
  userData;
  pageSubscriptions = new Subscription();
  isDetailModalPresent: boolean=false;
  constructor(private chatSrvc: ChatService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private common: Common,
    private userMgmtSrvc: UserManagementService,
    private modalCtrl: ModalController,
    private notificationSrvc: NotificationService) {
    this.userData = this.userMgmtSrvc.user.getValue();
    // this.chatSrvc.getChatRooms().then(d => {
    //   this.roomsList = d
    // })
    this.refreshChatList();
    // listen to notification events
    this.pageSubscriptions.add(this.notificationSrvc.notificationData$.subscribe((notif: any) => {
      if (notif) {
        // notification is pending to be processed
        if (notif.room) {
          this.refreshChatList(null, notif.room);
          this.chatDetail(notif)
        }
      }
    }))

    // subscribe to new chat messages from socket to update the list
    this.pageSubscriptions.add(this.chatSrvc.incomingMessage$.subscribe(data => {
      console.log(data)
      if (data && data.room && this.roomsList) {
        // new message has been recieved, process it
        let roomIndex = this.roomsList.findIndex(el => el.room == data.room);
        if (roomIndex > -1) {
          // the room is in the list that has been loaded, update the last message and increment unread count by one
          this.roomsList[roomIndex].lastMessage = data;
          if (!this.isDetailModalPresent) {
            this.roomsList[roomIndex].unread += 1;
          }
        }
        else {
          // TODO the room has not been loaded, so refresh the list
          this.refreshChatList()
        }
      }
    }))
  }

  ngOnInit() { }

  ionViewWillEnter() {
    // user has landed on this view, so hide the unread marker
    // this.chatSrvc.unreadCount$.next(false)
  }

  async inviteUser() {
    let alert = await this.alertCtrl.create({
      message: 'Input User ID',
      inputs: [{
        name: 'id',
        type: 'number',
        placeholder: 'User ID'
      }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            if (!isNaN(data.id)) {
              // user has given the user id, send it to socket
              this.chatSrvc.inviteUser(data.id).then((resp: any) => {
                console.log(resp)
                if (resp.status = 'success' && resp.msg) {
                  this.common.presentToast(resp.msg)
                  this.refreshChatList()
                }
              })
            }
          }
        }
      ]
    })
    await alert.present()
  }

  refreshChatList(event?, resetUnreadRoom?) {
    this.isLoading = true;
    this.chatSrvc.getRoomsList({}).then(d => {
      this.roomsList = d
      // reset the unread count, the user might have landed here from chat invite, or is opening the room for the first time
      if (resetUnreadRoom) {
        let index = this.roomsList.findIndex(el => el.room == resetUnreadRoom)
        if (index > -1) {
          this.roomsList[index].unread = 0;
        }
      }
    }).finally(() => {
      this.isLoading = false;
      if (event) {
        setTimeout(() => {
          event.target.complete()
        }, 200);
      }
    });
  }

  async chatDetail(item, i?) {
    // reset chat unread count to 0
    // if (i && this.roomsList && this.roomsList[i]) this.roomsList[i].unread = 0;
    item.unread = 0;
    const detail = await this.modalCtrl.create({
      component: ChatDetailComponent,
      componentProps: {
        id: item.room
      }
    })
    this.isDetailModalPresent = true;
    detail.onWillDismiss().then(data => {
      this.isDetailModalPresent = false
      this.chatSrvc.incomingMessage$.next(null);
      this.chatSrvc.chatReadByUser$.next(null);
    });
    return await detail.present()
  }

  ngOnDestroy() {
    this.notificationSrvc.notificationData$.next(null)
    this.chatSrvc.getUnreadCount();
    this.pageSubscriptions.unsubscribe();
  }
}
