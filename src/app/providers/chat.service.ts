import { LoggerService } from './../core/logger.service';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { GlobalConfigService } from './global-config.service';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  socketIO;
  private connecting = false;
  incomingMessage$ = new BehaviorSubject(null);
  chatReadByUser$ = new BehaviorSubject(null);
  unreadCount$ = new BehaviorSubject<Number>(0);
  roomList = [{
    room_id: 1,
    last_msg: "Hey how are you",
    msg_id: 2,
    users: [{
      firstName: 'Chat User 2'
    }],
    unreadCount: 2
  }]

  messages = [{
    id: 1,
    msg: "First message",
    user: {
      id: 2,
      firstName: 'Chat User 2'
    }
  }, {
    id: 2,
    msg: "Hey how are you",
    user: {
      id: 2,
      firstName: 'Chat User 2'
    }
  }]
  constructor(private storageSrvc: StorageService,
    private globalConfigSrvc: GlobalConfigService,
  private logger : LoggerService) {
    this.storageSrvc.getObject('chatList').then(d => {
      if (!d) {
        this.storageSrvc.setObject('chatList', this.roomList)
      }
      else {
        this.roomList = d
      }
    })
  }
  
  isConnected(){
    return this.socketIO.connected;
  }
  startSocketConnection() {
    // return;
    if (!this.socketIO) {
      this.socketIO = new Socket({
        url: environment.config.nodeServerEndPoint, options: {
          autoConnect: false,
          reconnectionAttempts: 10
        }
      }).ioSocket;
      this.monitorSocket();
    }
    if (this.connecting) {
      return;
    }
    if (this.socketIO.disconnected) {
      this.connecting = true;
      this.socketIO.io.opts.query = 'auth_token=' + this.globalConfigSrvc.authToken
      this.socketIO.connect();
    }
  }

  disconnectSocket() {
    this.socketIO.disconnect()
  }
  monitorSocket() {
    this.socketIO.on('connect', () => {
      this.connecting = false
      console.log("socket connected")
      if (this.globalConfigSrvc.pushToken) {
        this.updatePushToken(this.globalConfigSrvc.pushToken)
      }
      this.getUnreadCount().then((res)=>{});
    });

    this.socketIO.on('connect_error', () => {
      this.connecting = false
    });

    this.socketIO.on('connect_timeout', () => {
      this.connecting = false
    });

    this.socketIO.on('error', () => {
      this.connecting = false
    });

    this.socketIO.on('disconnect', () => {
      this.connecting = false
      console.log("socket disconnected")
    });

    this.socketIO.on('new.message', this.onNewMessage)
    this.socketIO.on('chat.readByUser', this.onChatReadByUser)
    // this.socketIO.on('reconnect_attempt', () => {
    // 	console.log("socket reconnecting...", this.authSrvc.token)
    // 	this.socketIO.io.opts.query = 'token=' + this.authSrvc.token;
    // });
  }


  onNewMessage = (data) => {
    // new message from the server, handle it here  
    this.incomingMessage$.next(data)
  }

  onChatReadByUser = (data) => {
    // new message from the server, handle it here  
    this.chatReadByUser$.next(data)
  }
  
  getChatRooms() {
    return new Promise((resolve, reject) => {
      resolve(this.roomList)
    })
  }

  /* getMessages(room_id) {
    return new Promise((resolve, reject) => {
      resolve(this.messages)
    })
  } */

  getMessages(data) {
    return new Promise((resolve, reject) => {
      this.socketIO.emit('chat.get', data, (res) => {
        resolve(res)
      })
    })
  }
  getRoomsList(query) {
    return new Promise((resolve, reject) => {
      // load the message list for the first time
      this.socketIO.emit('rooms.list', query, (data) => {
        resolve(data)
      })
    })
  }

  inviteUser(query) {
    return new Promise((resolve, reject) => {
      // load the message list for the first time
      this.socketIO.emit('chat.invite', query, (data) => {
        resolve(data)
      })
    })
  }
  sendMessage(data) {
    return new Promise((resolve, reject) => {
      this.socketIO.emit('new.message', data, (res) => {
        resolve(res)
      })
    })
  }

  async markMsgRead(room,msgId?) {
    this.socketIO.emit('chat.markMsgRead', {room,msgId}, (res) => {
      this.logger.log("ChatService : markMsgRead : ",res)
    })
  }

  getUnreadCount() {
    return new Promise((resolve, reject) => {
      this.socketIO.emit('chat.unreadCount', {}, (res) => {
        this.unreadCount$.next(res)
        resolve(res)
      })
    })
  }

  updatePushToken(token){
    if (this.socketIO && this.socketIO.connected) {
      this.socketIO.emit('push.updateToken', { token }, (res) => {

      })
    }
  }

  ngOnDestroy() {
    this.socketIO.removeListener('new.message', this.onNewMessage)
    this.socketIO.removeListener('chat.readByUser', this.onChatReadByUser)
  }
}
