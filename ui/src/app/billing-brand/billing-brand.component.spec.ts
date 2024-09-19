import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingBrandComponent } from './billing-brand.component';

describe('BillingBrandComponent', () => {
  let component: BillingBrandComponent;
  let fixture: ComponentFixture<BillingBrandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingBrandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
