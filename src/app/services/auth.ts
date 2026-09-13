import { Injectable } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private supabaseService: Supabase) {}

  async signUp(
    fullName: string,
    email: string,
    password: string
  ) {
    const client = this.supabaseService.getClient();

    return await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
  }

  async signIn(
    email: string,
    password: string
  ) {
    const client = this.supabaseService.getClient();

    return await client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    const client = this.supabaseService.getClient();

    return await client.auth.signOut();
  }

  async getSession() {
    const client = this.supabaseService.getClient();

    return await client.auth.getSession();
  }

  isLoggedIn(): boolean {

    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(
      'skillkamao-logged-in'
    ) === 'true';
  }

  getCurrentUser() {

    if (typeof localStorage === 'undefined') {
      return null;
    }

    const user = localStorage.getItem(
      'skillkamao-current-user'
    );

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  logout(): void {

    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(
      'skillkamao-logged-in'
    );

    localStorage.removeItem(
      'skillkamao-current-user'
    );
  }
}