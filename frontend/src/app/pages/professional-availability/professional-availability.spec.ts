import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalAvailability } from './professional-availability';

describe('ProfessionalAvailability', () => {
  let component: ProfessionalAvailability;
  let fixture: ComponentFixture<ProfessionalAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalAvailability],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalAvailability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
