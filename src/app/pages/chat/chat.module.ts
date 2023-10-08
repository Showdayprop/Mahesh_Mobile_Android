import { ChatLabelPipe } from './../../pipes/chat-label.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';
import { TimeagoModule } from 'ngx-timeago';

import { ChatPage } from './chat.page';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';

@NgModule({
  entryComponents:[ChatDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    TimeagoModule.forChild()
  ],
  declarations: [ChatPage, ChatListComponent,
    ChatDetailComponent,
    ChatLabelPipe]
})
export class ChatPageModule { }
