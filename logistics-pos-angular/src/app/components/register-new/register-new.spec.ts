import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNew } from './register-new';

describe('RegisterNew', () => {
  let component: RegisterNew;
  let fixture: ComponentFixture<RegisterNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterNew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
