import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectBankTransferModalComponent } from './direct-bank-transfer-modal.component';

describe('DirectBankTransferModalComponent', () => {
  let component: DirectBankTransferModalComponent;
  let fixture: ComponentFixture<DirectBankTransferModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectBankTransferModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectBankTransferModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
