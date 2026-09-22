import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalServices } from './professional-services';

describe('ProfessionalServices', () => {
  let component: ProfessionalServices;
  let fixture: ComponentFixture<ProfessionalServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalServices],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
