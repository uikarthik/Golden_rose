import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditsubtypeComponent } from './editsubtype.component';

describe('EditsubtypeComponent', () => {
  let component: EditsubtypeComponent;
  let fixture: ComponentFixture<EditsubtypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditsubtypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditsubtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
