import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouterHelperService {
  public currentUrl;
  public previousUrlSub: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public currentUrlSub: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _unsubscribe = new Subscription();

  constructor(private router: Router) {
    this._unsubscribe.add(this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.previousUrlSub.next(this.currentUrl);
      this.currentUrlSub.next(event.url);
      this.currentUrl = event.url;
    }));
  }
  ngOnDestroy() {
    this._unsubscribe.unsubscribe();
  }
}
