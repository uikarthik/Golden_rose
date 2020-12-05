import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingimageComponent } from './landingimage.component';

describe('LandingimageComponent', () => {
  let component: LandingimageComponent;
  let fixture: ComponentFixture<LandingimageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingimageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
