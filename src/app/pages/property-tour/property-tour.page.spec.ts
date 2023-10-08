import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyTourPage } from './property-tour.page';

describe('PropertyTourPage', () => {
  let component: PropertyTourPage;
  let fixture: ComponentFixture<PropertyTourPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyTourPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyTourPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
