import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsCreatorComponent } from './chats-creator.component';

describe('ChatsCreatorComponent', () => {
  let component: ChatsCreatorComponent;
  let fixture: ComponentFixture<ChatsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatsCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
