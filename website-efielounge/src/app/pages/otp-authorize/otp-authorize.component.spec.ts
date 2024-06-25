import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpAuthorizeComponent } from './otp-authorize.component';

describe('OtpAuthorizeComponent', () => {
  let component: OtpAuthorizeComponent;
  let fixture: ComponentFixture<OtpAuthorizeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtpAuthorizeComponent]
    });
    fixture = TestBed.createComponent(OtpAuthorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
