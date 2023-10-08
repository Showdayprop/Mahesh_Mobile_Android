import { BookingFormComponent } from './booking-form/booking-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarEventsComponent } from '../../components/calendar-events/calendar-events.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarEventsComponent,
  },
  {
    path: 'booking-list',
    loadChildren: () => import('./booking-list/booking-list.module').then(m => m.BookingListPageModule)
  },
  {
    path: 'booking-form',
    component: BookingFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingRoutingModule { }
