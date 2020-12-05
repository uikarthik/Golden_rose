import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTypeaddComponent } from './sub-typeadd.component';

describe('SubTypeaddComponent', () => {
  let component: SubTypeaddComponent;
  let fixture: ComponentFixture<SubTypeaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubTypeaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTypeaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
