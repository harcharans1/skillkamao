import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private supabaseService: Supabase
  ) {}

  async createAccount() {

    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.fullName.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage =
        'Please fill in all fields.';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage =
        'Please enter a valid email address.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage =
        'Passwords do not match.';
      return;
    }

    if (!this.termsAccepted) {
      this.errorMessage =
        'Please accept the Terms & Conditions.';
      return;
    }

    try {

      const { data, error } =
        await this.auth.signUp(
          this.fullName.trim(),
          this.email.trim().toLowerCase(),
          this.password
        );

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      if (!data.user) {
        this.errorMessage =
          'Account could not be created.';
        return;
      }

      const client =
        this.supabaseService.getClient();

      const { error: profileError } =
        await client
          .from('students')
          .insert({
            id: data.user.id,
            full_name: this.fullName.trim(),
            email: this.email.trim().toLowerCase()
          });

      if (profileError) {
        this.errorMessage =
          profileError.message;
        return;
      }

      this.successMessage =
        'Account created successfully!';

      this.fullName = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.termsAccepted = false;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);

    } catch (error) {

      console.error(error);

      this.errorMessage =
        'Something went wrong. Please try again.';
    }
  }
}