import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private router = inject(Router);

  isAdminPage = signal(this.checkAdminPage(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        this.isAdminPage.set(
          this.checkAdminPage(event.urlAfterRedirects)
        );
      });
  }

  private checkAdminPage(url: string): boolean {
    return (
      url === '/admin' ||
      url.startsWith('/admin-courses') ||
      url.startsWith('/admin-students') ||
      url.startsWith('/admin-certificates') ||
      url.startsWith('/admin-lessons') ||
      url === '/admin-login'
    );
  }
}