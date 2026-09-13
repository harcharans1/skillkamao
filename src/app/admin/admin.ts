import { Component, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { Supabase } from '../services/supabase';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-admin',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  // =========================================
  // ADMIN NAME
  // =========================================

  adminName = 'SkillKamao Admin';


  // =========================================
  // SUPABASE LIVE STATS
  // =========================================

  totalStudents = signal(0);

  totalCourses = signal(0);

  totalLessons = signal(0);

  pendingCertificates = signal(0);

  completedCourses = signal(0);


  // =========================================
  // LOADING
  // =========================================

  loading = signal(true);


  constructor(
    private router: Router,
    private supabaseService: Supabase,
    private auth: Auth
  ) {

    this.loadAdmin();

    this.loadStats();

  }


  // =========================================
  // LOAD ADMIN
  // =========================================

  loadAdmin() {

    if (
      typeof localStorage === 'undefined'
    ) {
      return;
    }


    const adminData =
      localStorage.getItem(
        'skillkamao-admin'
      );


    if (!adminData) {
      return;
    }


    try {

      const admin =
        JSON.parse(adminData);


      if (admin?.full_name) {

        this.adminName =
          admin.full_name;

      }

      else if (admin?.email) {

        this.adminName =
          admin.email;

      }

    } catch (error) {

      console.error(
        'Admin data error:',
        error
      );

    }

  }


  // =========================================
  // LOAD SUPABASE STATS
  // =========================================

  async loadStats() {

    this.loading.set(true);

    const client =
      this.supabaseService.getClient();


    // =======================================
    // STUDENTS
    // =======================================

    try {

      const {
        count,
        error
      } = await client
        .from('students')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq('role', 'student');


      if (error) {

        console.error(
          'Students count error:',
          error
        );

      } else {

        this.totalStudents.set(
          count ?? 0
        );

      }

    } catch (error) {

      console.error(
        'Students exception:',
        error
      );

    }


    // =======================================
    // COURSES
    // =======================================

    try {

      const {
        count,
        error
      } = await client
        .from('courses')
        .select('id', {
          count: 'exact',
          head: true
        });


      if (error) {

        console.error(
          'Courses count error:',
          error
        );

      } else {

        this.totalCourses.set(
          count ?? 0
        );

      }

    } catch (error) {

      console.error(
        'Courses exception:',
        error
      );

    }


    // =======================================
    // LESSONS
    // =======================================

    try {

      const {
        count,
        error
      } = await client
        .from('lessons')
        .select('id', {
          count: 'exact',
          head: true
        });


      if (error) {

        console.error(
          'Lessons count error:',
          error
        );

      } else {

        this.totalLessons.set(
          count ?? 0
        );

      }

    } catch (error) {

      console.error(
        'Lessons exception:',
        error
      );

    }


    // =======================================
    // PENDING CERTIFICATES
    // =======================================

    try {

      const {
        count,
        error
      } = await client
        .from('certificates')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq(
          'status',
          'pending'
        );


      if (error) {

        console.error(
          'Pending certificates error:',
          error
        );

      } else {

        this.pendingCertificates.set(
          count ?? 0
        );

      }

    } catch (error) {

      console.error(
        'Pending certificates exception:',
        error
      );

    }


    // =======================================
    // APPROVED CERTIFICATES
    // =======================================

    try {

      const {
        count,
        error
      } = await client
        .from('certificates')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq(
          'status',
          'approved'
        );


      if (error) {

        console.error(
          'Approved certificates error:',
          error
        );

      } else {

        this.completedCourses.set(
          count ?? 0
        );

      }

    } catch (error) {

      console.error(
        'Approved certificates exception:',
        error
      );

    }


    this.loading.set(false);


    console.log(
      'ADMIN SUPABASE STATS',
      {
        students:
          this.totalStudents(),

        courses:
          this.totalCourses(),

        lessons:
          this.totalLessons(),

        pending:
          this.pendingCertificates(),

        approved:
          this.completedCourses()
      }
    );

  }


  // =========================================
  // LOGOUT
  // =========================================

  async logout() {

    try {

      await this.auth.signOut();

    } catch (error) {

      console.error(
        'Supabase logout error:',
        error
      );

    }


    if (
      typeof localStorage !== 'undefined'
    ) {

      localStorage.removeItem(
        'skillkamao-admin-logged-in'
      );

      localStorage.removeItem(
        'skillkamao-admin'
      );

    }


    await this.router.navigate([
      '/admin-login'
    ]);

  }

}