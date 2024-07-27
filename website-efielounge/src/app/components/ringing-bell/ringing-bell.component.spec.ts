import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingingBellComponent } from './ringing-bell.component';

describe('RingingBellComponent', () => {
  let component: RingingBellComponent;
  let fixture: ComponentFixture<RingingBellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RingingBellComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RingingBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
