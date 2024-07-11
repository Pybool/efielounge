import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteLoaderSpinnerComponent } from './infinite-loader-spinner.component';

describe('InfiniteLoaderSpinnerComponent', () => {
  let component: InfiniteLoaderSpinnerComponent;
  let fixture: ComponentFixture<InfiniteLoaderSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfiniteLoaderSpinnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfiniteLoaderSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
