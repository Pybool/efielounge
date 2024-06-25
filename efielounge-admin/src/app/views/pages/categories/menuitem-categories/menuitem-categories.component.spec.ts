import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuitemCategoriesComponent } from './menuitem-categories.component';

describe('MenuitemCategoriesComponent', () => {
  let component: MenuitemCategoriesComponent;
  let fixture: ComponentFixture<MenuitemCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuitemCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuitemCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
