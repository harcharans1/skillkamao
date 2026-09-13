import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  rememberMe = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  async login() {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage =
        'Please enter your email and password.';
      return;
    }

    try {

      const { data, error } =
        await this.auth.signIn(
          this.email.trim().toLowerCase(),
          this.password
        );

      if (error) {
        this.errorMessage =
          'Invalid email or password.';
        return;
      }

      if (!data.user) {
        this.errorMessage =
          'Login failed. Please try again.';
        return;
      }

      localStorage.setItem(
        'skillkamao-logged-in',
        'true'
      );

      localStorage.setItem(
        'skillkamao-current-user',
        JSON.stringify({
          fullName:
            data.user.user_metadata?.['full_name'] ||
            'Student',
          email:
            data.user.email
        })
      );

      this.successMessage =
        'Login successful!';

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 700);

    } catch (error) {

      console.error(error);

      this.errorMessage =
        'Something went wrong. Please try again.';
    }
  }
}