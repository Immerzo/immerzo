import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsBrandComponent } from './projects-brand.component';

describe('ProjectsBrandComponent', () => {
  let component: ProjectsBrandComponent;
  let fixture: ComponentFixture<ProjectsBrandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsBrandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
