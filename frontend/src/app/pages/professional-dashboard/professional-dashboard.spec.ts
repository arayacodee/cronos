import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalDashboard } from './professional-dashboard';

describe('ProfessionalDashboard', () => {
  let component: ProfessionalDashboard;
  let fixture: ComponentFixture<ProfessionalDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
