import { Routes } from '@angular/router';

import { HomeComponent } from './home/home';
import { Skills } from './skills/skills';
import { Courses } from './courses/courses';
import { CourseDetails } from './course-details/course-details';
import { Lesson } from './lesson/lesson';
import { Dashboard } from './dashboard/dashboard';
import { Roadmaps } from './roadmaps/roadmaps';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { Certificates } from './certificates/certificates';
import { authGuard } from './guards/auth-guard';
import { AdminLogin } from './admin-login/admin-login';
import { Admin } from './admin/admin';
import { adminGuard } from './guards/admin-guard';
import { AdminCourses } from './admin-courses/admin-courses';
import { AdminStudents } from './admin-students/admin-students';
import { AdminCertificates } from './admin-certificates/admin-certificates';
import { AdminLessons } from './admin-lessons/admin-lessons';

export const routes: Routes = [

  { path: '', component: HomeComponent },

  { path: 'skills', component: Skills },

  { path: 'courses', component: Courses },

  {
    path: 'course-details/:courseName',
    component: CourseDetails
  },

  {
    path: 'lesson/:courseName',
    component: Lesson
  },

  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  {
    path: 'roadmaps',
    component: Roadmaps
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'signup',
    component: Signup
  },

  { path: 'about', component: About },

  { path: 'contact', component: Contact },

  { path: 'certificates', component: Certificates, canActivate: [authGuard] },

  { path: 'admin-login', component: AdminLogin },

  { path: 'admin-courses', component: AdminCourses, canActivate: [adminGuard] },

  { path: 'admin-students', component: AdminStudents, canActivate: [adminGuard] },

  {
    path: 'admin-lessons/:courseId',
    component: AdminLessons,
    canActivate: [adminGuard]
  },

  {
  path: 'admin-certificates',
  component: AdminCertificates,
  canActivate: [adminGuard]
},

  { path: 'admin', component: Admin, canActivate: [adminGuard] },

];