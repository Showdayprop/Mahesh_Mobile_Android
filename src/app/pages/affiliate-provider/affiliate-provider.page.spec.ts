import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AffiliateProviderPage } from './affiliate-provider.page';

describe('AffiliateProviderPage', () => {
  let component: AffiliateProviderPage;
  let fixture: ComponentFixture<AffiliateProviderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffiliateProviderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AffiliateProviderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
