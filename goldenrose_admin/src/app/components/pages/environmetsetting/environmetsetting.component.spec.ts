import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmetsettingComponent } from './environmetsetting.component';

describe('EnvironmetsettingComponent', () => {
  let component: EnvironmetsettingComponent;
  let fixture: ComponentFixture<EnvironmetsettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvironmetsettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmetsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
