import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeviceLogsPage } from './device-logs.page';

describe('DeviceLogsPage', () => {
  let component: DeviceLogsPage;
  let fixture: ComponentFixture<DeviceLogsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceLogsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceLogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
