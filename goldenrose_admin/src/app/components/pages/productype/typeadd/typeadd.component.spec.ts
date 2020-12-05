import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaddComponent } from './typeadd.component';

describe('TypeaddComponent', () => {
  let component: TypeaddComponent;
  let fixture: ComponentFixture<TypeaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
