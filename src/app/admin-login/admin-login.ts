import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  email = '';
  password = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private supabaseService: Supabase
  ) {}

  async loginAdmin() {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage =
        'Please enter admin email and password.';
      return;
    }

    try {

      const { data, error } =
        await this.auth.signIn(
          this.email.trim().toLowerCase(),
          this.password
        );

      if (error || !data.user) {
        this.errorMessage =
          'Invalid admin email or password.';
        return;
      }

      const client =
        this.supabaseService.getClient();

      const { data: student, error: profileError } =
        await client
          .from('students')
          .select('full_name, email, role')
          .eq('id', data.user.id)
          .single();

      if (profileError || !student) {
        await this.auth.signOut();

        this.errorMessage =
          'Admin profile not found.';
        return;
      }

      if (student.role !== 'admin') {
        await this.auth.signOut();

        this.errorMessage =
          'You do not have admin access.';
        return;
      }

      localStorage.setItem(
        'skillkamao-admin-logged-in',
        'true'
      );

      localStorage.setItem(
        'skillkamao-admin',
        JSON.stringify({
          name: student.full_name,
          email: student.email
        })
      );

      this.successMessage =
        'Admin login successful!';

      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 700);

    } catch (error) {

      console.error(error);

      this.errorMessage =
        'Something went wrong. Please try again.';
    }
  }
}