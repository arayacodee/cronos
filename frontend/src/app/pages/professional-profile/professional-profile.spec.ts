import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfessionalProfile } from './professional-profile';

describe('ProfessionalProfile', () => {
  let component: ProfessionalProfile;
  let fixture: ComponentFixture<ProfessionalProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
