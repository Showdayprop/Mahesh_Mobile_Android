import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyVideoPage } from './property-video.page';

describe('PropertyVideoPage', () => {
  let component: PropertyVideoPage;
  let fixture: ComponentFixture<PropertyVideoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyVideoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyVideoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
