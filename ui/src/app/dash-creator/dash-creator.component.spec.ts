import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashCreatorComponent } from './dash-creator.component';

describe('DashCreatorComponent', () => {
  let component: DashCreatorComponent;
  let fixture: ComponentFixture<DashCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
