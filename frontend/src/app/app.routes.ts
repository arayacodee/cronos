import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Business } from './pages/business/business';
import { Booking } from './pages/booking/booking';
import { Login } from './pages/login/login';
import { ProfessionalDashboard } from './pages/professional-dashboard/professional-dashboard';
import { MyReservations } from './pages/my-reservations/my-reservations';
import { ProfessionalServices } from './pages/professional-services/professional-services';
import { ProfessionalAvailability } from './pages/professional-availability/professional-availability';
import { clientGuard } from './core/guards/client.guard';
import { professionalGuard } from './core/guards/professional.guard';
import { ProfessionalOnboarding } from './pages/professional-onboarding/professional-onboarding';
import { ProfessionalProfile } from './pages/professional-profile/professional-profile';


export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'about',
    component: About
  },
  {
    path: 'business/:id',
    component: Business
  },
  {
    path: 'booking/:serviceId',
    component: Booking,
    canActivate: [clientGuard]
  },
  {
    path: 'my-reservations',
    component: MyReservations,
    canActivate: [clientGuard]
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: ProfessionalDashboard,
    canActivate: [professionalGuard]
  },
  {
    path: 'dashboard/services',
    component: ProfessionalServices,
    canActivate: [professionalGuard]
  },
  {
    path: 'dashboard/availability',
    component: ProfessionalAvailability,
    canActivate: [professionalGuard]
  },
  {
    path: 'professional/setup',
    component: ProfessionalOnboarding,
    canActivate: [professionalGuard]
  },
  {
    path: 'dashboard/profile',
    component: ProfessionalProfile,
    canActivate: [professionalGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
