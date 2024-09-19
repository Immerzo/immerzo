import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsBrandComponent } from './chats-brand.component';

describe('ChatsBrandComponent', () => {
  let component: ChatsBrandComponent;
  let fixture: ComponentFixture<ChatsBrandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatsBrandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatsBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
