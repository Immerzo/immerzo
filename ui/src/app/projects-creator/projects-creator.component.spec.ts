import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsCreatorComponent } from './projects-creator.component';

describe('ProjectsCreatorComponent', () => {
  let component: ProjectsCreatorComponent;
  let fixture: ComponentFixture<ProjectsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectsCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
