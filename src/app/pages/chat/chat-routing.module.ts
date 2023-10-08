import { ChatListComponent } from './chat-list/chat-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatPage } from './chat.page';

const routes: Routes = [
  {
    path: '',
    component: ChatPage,
    children: [
      {
        path: 'chat-list',
        component: ChatListComponent
      },
      {
        path: '',
        redirectTo: '/chat/chat-list',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatPageRoutingModule { }
