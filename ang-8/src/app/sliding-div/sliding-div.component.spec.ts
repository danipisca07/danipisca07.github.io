import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingDivComponent } from './sliding-div.component';

describe('SlidingDivComponent', () => {
  let component: SlidingDivComponent;
  let fixture: ComponentFixture<SlidingDivComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidingDivComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidingDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
