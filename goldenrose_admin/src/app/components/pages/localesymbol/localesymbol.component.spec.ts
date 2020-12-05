import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalesymbolComponent } from './localesymbol.component';

describe('LocalesymbolComponent', () => {
  let component: LocalesymbolComponent;
  let fixture: ComponentFixture<LocalesymbolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalesymbolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalesymbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
