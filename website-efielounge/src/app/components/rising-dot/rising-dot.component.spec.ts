import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisingDotComponent } from './rising-dot.component';

describe('RisingDotComponent', () => {
  let component: RisingDotComponent;
  let fixture: ComponentFixture<RisingDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RisingDotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RisingDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
