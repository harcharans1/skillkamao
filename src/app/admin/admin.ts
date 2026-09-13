import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  adminName = 'SkillKamao Admin';

  totalStudents = 0;
  totalCourses = 4;
  pendingCertificates = 0;
  completedCourses = 0;

  constructor(private router: Router) {
    this.loadStats();
  }

  loadStats() {

    if (typeof localStorage === 'undefined') {
      return;
    }

    const pending =
      localStorage.getItem(
        'skillkamao-pending-certificates'
      );

    if (pending) {
      this.pendingCertificates =
        JSON.parse(pending).length;
    }

    /*
      Student accounts are currently stored
      individually for demo purposes.
    */

    const user =
      localStorage.getItem(
        'skillkamao-user'
      );

    if (user) {
      this.totalStudents = 1;
    }

    const completed =
      localStorage.getItem(
        'skillkamao-earned-certificates'
      );

    if (completed) {
      this.completedCourses =
        JSON.parse(completed).length;
    }

  }

  logout() {

    localStorage.removeItem(
      'skillkamao-admin-logged-in'
    );

    localStorage.removeItem(
      'skillkamao-admin'
    );

    this.router.navigate(['/admin-login']);

  }

}