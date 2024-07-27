import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSiteHomepageComponent } from './client-site-homepage.component';

describe('ClientSiteHomepageComponent', () => {
  let component: ClientSiteHomepageComponent;
  let fixture: ComponentFixture<ClientSiteHomepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSiteHomepageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientSiteHomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
