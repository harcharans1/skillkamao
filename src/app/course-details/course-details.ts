import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-course-details',
  imports: [RouterLink],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css'
})
export class CourseDetails {

  course = signal<any>(null);
  lessons = signal<any[]>([]);

  constructor(
    private route: ActivatedRoute,
    private supabaseService: Supabase
  ) {
    this.loadCourse();
  }

  async loadCourse() {

    const courseName =
      this.route.snapshot.paramMap.get('courseName');

    if (!courseName) {
      return;
    }

    const client =
      this.supabaseService.getClient();

    const { data, error } =
      await client
        .from('courses')
        .select('*')
        .eq('name', courseName)
        .eq('published', true)
        .single();

    if (error) {
      console.error('Course loading error:', error);
      return;
    }

    this.course.set(data);

    console.log('Course loaded:', data);

    this.loadLessons(data.id);
  }

  async loadLessons(courseId: string) {

    const client =
      this.supabaseService.getClient();

    const { data, error } =
      await client
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_number', { ascending: true });

    if (error) {
      console.error('Lessons loading error:', error);
      return;
    }

    console.log('Lessons loaded:', data);

    this.lessons.set(data || []);
  }
}