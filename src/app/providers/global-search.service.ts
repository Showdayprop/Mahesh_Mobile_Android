import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  searchInput = new BehaviorSubject(null);
  searchResult = new BehaviorSubject(null);
  origin: string;
  requireCategorySelection: boolean = false;
  constructor() { }
}
