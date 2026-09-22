import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalOnboarding } from './professional-onboarding';

describe('ProfessionalOnboarding', () => {
  let component: ProfessionalOnboarding;
  let fixture: ComponentFixture<ProfessionalOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalOnboarding],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalOnboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
