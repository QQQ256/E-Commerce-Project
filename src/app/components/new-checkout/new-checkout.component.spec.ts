import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCheckoutComponent } from './new-checkout.component';

describe('NewCheckoutComponent', () => {
  let component: NewCheckoutComponent;
  let fixture: ComponentFixture<NewCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewCheckoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
