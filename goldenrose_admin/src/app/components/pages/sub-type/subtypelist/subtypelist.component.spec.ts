import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtypelistComponent } from './subtypelist.component';

describe('SubtypelistComponent', () => {
  let component: SubtypelistComponent;
  let fixture: ComponentFixture<SubtypelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtypelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtypelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
