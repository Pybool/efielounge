import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartDockedComponent } from './cart-docked.component';

describe('CartDockedComponent', () => {
  let component: CartDockedComponent;
  let fixture: ComponentFixture<CartDockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartDockedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartDockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
