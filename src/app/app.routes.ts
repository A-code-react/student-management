import { Routes } from '@angular/router';
import { RegisterStudentComponent } from './components/register-student/register-student.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Default route - redirect to student list
  {
    path: '',
    redirectTo: '/list-student',
    pathMatch: 'full'
  },

  // Login route - only accessible for non-logged-in users
  {
    path: 'login',
    loadComponent: () => import('./components/login-student/login-student.component')
      .then(m => m.LoginStudentComponent),
    canActivate: [guestGuard]
  },

  {
    path: 'list-student',
    loadComponent: () => import('./components/list-student/list-student.component')
      .then(m => m.ListStudentComponent),
    canActivate: [authGuard]
  },

  {
    path: 'add-student',
    loadComponent: () => import('./components/add-student/add-student.component')
      .then(m => m.AddStudentComponent),
    canActivate: [authGuard]
  },
  {
  path: 'edit-student/:id',
  loadComponent: () => import('./components/add-student/add-student.component')
    .then(m => m.AddStudentComponent),
  canActivate: [authGuard]
},
{
  path: 'dashboard',
  loadComponent: () =>
    import('./dashboard/student-dashboard/student-dashboard.component')
      .then(m => m.StudentDashboardComponent),
  canActivate: [authGuard]
},
{
  path: 'student/:id',
  loadComponent: () =>
    import('./components/student-profile/student-profile.component')
      .then(m => m.StudentProfileComponent),
  canActivate: [authGuard]
},
  {
    path: 'register',
    component: RegisterStudentComponent,
    canActivate: [guestGuard]
  },
  // Wildcard route - redirect to default (student list)
  {
    path: '**',
    redirectTo: '/list-student'
  }
];
