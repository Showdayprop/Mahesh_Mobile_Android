import { UserManagementService } from './../../../providers/user-management.service';
import { Subscription } from 'rxjs';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavParams } from '@ionic/angular';
import { ChatService } from '../../../providers/chat.service';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.scss'],
})
export class ChatDetailComponent implements OnInit {
  @ViewChild(IonContent, { static: true }) content: IonContent;
  room_id;
  messages = [];
  message;
  pageSubscriptions = new Subscription();
  userData;
  participants;
  participantsAccountIds = [];
  limit = 10;
  metaData = {
    limit: 10,
    page: 0
  };
  constructor(private chatSrvc: ChatService,
    public zone: NgZone,
    private userMgmtSrvc: UserManagementService,
    public modalCtrl: ModalController,
    private navParams: NavParams) {
    this.userData = this.userMgmtSrvc.user.getValue();
    this.room_id = this.navParams.get('id')
    this.fetchMessages();

    this.pageSubscriptions.add(this.chatSrvc.incomingMessage$.subscribe(data => {
      console.log(data)
      if (data && data.room && data.room == this.room_id) {
        // new message is for this current room, so process it
        this.messages.push(data)
        this.chatSrvc.markMsgRead(data.room,data._id);
        this.zone.run(() => {
          setTimeout(() => {
            this.content.scrollToBottom(300);
          }, 500)
        })
      }
    }))

    this.pageSubscriptions.add(this.chatSrvc.chatReadByUser$.subscribe(data => {
      console.log(data)
      if (data && data.room && data.room == this.room_id && data.user) {
        if (data.msg) {
          // only one message has to be updated
          let msg = this.messages.find(el => el._id == data.msg)
          if (msg) {
            msg.read.push(data.user)
          }
        }
        else {
          // all messages read
          this.messages = this.messages.map(el => {
            el.read.push(data.user);
            return el;
          })
        }
      }
    }))

  }

  ngOnInit() {
  }
  ionViewDidEnter() {
    this.content.scrollToBottom(200);
  }

  fetchMessages() {
    if (!this.metaData['hasNextPage'] && this.metaData.page > 0) return;
    this.chatSrvc.getMessages({
      room: this.room_id,
      markRead: this.metaData.page == 0,
      limit: this.metaData.limit,
      page: this.metaData.page + 1
    }).then((d: any) => {
      if (d) { 
        if(d.msg) this.messages = [...d.msg,...this.messages]
        if (d.users && d.users.length>1 && this.metaData.page == 0) {
          this.participants = d.users.filter(el => el.account_id != this.userData.id);
          this.participantsAccountIds = this.participants.map(el=>el.account_id)
        }
        if(d.metaData) this.metaData = d.metaData
      }
    })
  }
  chatSubmit() {
    if (this.message) {
      this.messages.push({
        msg: this.message,
        room:this.room_id,
        user: {
          account_id: this.userData.id,
          first_name: this.userData.first_name
        },
        read: [],
        createdAt:new Date().toISOString()
      })
      setTimeout(() => {
        this.content.scrollToBottom(300);
      },300)
      // send the message to the server with the room
      this.chatSrvc.sendMessage({
        msg: this.message,
        room: this.room_id,
        indx:this.messages.length-1
      }).then(res => {
        this.messages[res['indx']] = res
        // this.messages.push(res)
        // this.message = ''
        // this.zone.run(() => {
        //   setTimeout(() => {
        //     this.content.scrollToBottom(300);
        //   })
        // })
      })
      this.message = '';
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.pageSubscriptions.unsubscribe();
  }
}
