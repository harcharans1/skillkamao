import {
  Component,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-courses',
  imports: [RouterLink],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {

  courses = signal<any[]>([]);

  constructor(
    private supabaseService: Supabase
  ) {
    this.loadCourses();
  }

  async loadCourses() {

    const client =
      this.supabaseService.getClient();

    const { data, error } =
      await client
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', {
          ascending: true
        });

    if (error) {

      console.error(
        'Courses loading error:',
        error
      );

      return;
    }

    console.log(
      'Courses from Supabase:',
      data
    );

    this.courses.set(data || []);
  }
}