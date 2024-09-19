import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashBrandComponent } from './dash-brand.component';

describe('DashBrandComponent', () => {
  let component: DashBrandComponent;
  let fixture: ComponentFixture<DashBrandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashBrandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
