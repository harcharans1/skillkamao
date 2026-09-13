import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-admin-courses',
  imports: [FormsModule],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCourses {

  courses = signal<any[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);

  courseName = '';
  description = '';
  icon = '📚';
  level = 'BEGINNER';
  duration = '0 Hours';
  rating = 5.0;
  published = true;

  constructor(
    private supabaseService: Supabase
  ) {
    this.loadCourses();
  }

  async loadCourses() {

    this.loading.set(true);

    const client = this.supabaseService.getClient();

    const { data, error } =
      await client
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
      console.error('Admin courses loading error:', error);
      this.loading.set(false);
      return;
    }

    console.log('Admin courses:', data);

    this.courses.set(data || []);
    this.loading.set(false);
  }


  openAddCourse() {

    this.courseName = '';
    this.description = '';
    this.icon = '📚';
    this.level = 'BEGINNER';
    this.duration = '0 Hours';
    this.rating = 5.0;
    this.published = true;

    this.showForm.set(true);
  }


  closeAddCourse() {
    this.showForm.set(false);
  }


  async saveCourse() {

    if (
      !this.courseName.trim() ||
      !this.description.trim()
    ) {

      alert('Please enter course name and description.');

      return;
    }


    this.saving.set(true);

    const client = this.supabaseService.getClient();


    const { data, error } =
      await client
        .from('courses')
        .insert({
          name: this.courseName.trim(),
          description: this.description.trim(),
          icon: this.icon.trim() || '📚',
          level: this.level,
          duration: this.duration.trim() || '0 Hours',
          rating: Number(this.rating) || 5.0,
          published: this.published
        })
        .select()
        .single();


    if (error) {

      console.error('Course insert error:', error);

      alert('Course save nahi hoya. Console check karo.');

      this.saving.set(false);

      return;
    }


    console.log('Course created:', data);

    alert('Course successfully added! ✅');

    this.saving.set(false);

    this.showForm.set(false);

    await this.loadCourses();
  }

}