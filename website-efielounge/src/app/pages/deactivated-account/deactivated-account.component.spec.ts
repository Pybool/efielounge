import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivatedAccountComponent } from './deactivated-account.component';

describe('DeactivatedAccountComponent', () => {
  let component: DeactivatedAccountComponent;
  let fixture: ComponentFixture<DeactivatedAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeactivatedAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeactivatedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
