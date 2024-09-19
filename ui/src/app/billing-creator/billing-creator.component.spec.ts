import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingCreatorComponent } from './billing-creator.component';

describe('BillingCreatorComponent', () => {
  let component: BillingCreatorComponent;
  let fixture: ComponentFixture<BillingCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
