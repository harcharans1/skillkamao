import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-admin-courses',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCourses {

  courses = signal<any[]>([]);
  loading = signal(true);

  showForm = signal(false);
  saving = signal(false);
  deleting = signal(false);

  // Edit mode
  editMode = signal(false);
  editingCourseId = '';

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


  // LOAD COURSES

  async loadCourses() {

    this.loading.set(true);

    const client =
      this.supabaseService.getClient();

    const { data, error } =
      await client
        .from('courses')
        .select('*')
        .order('created_at', {
          ascending: true
        });

    if (error) {

      console.error(
        'Admin courses loading error:',
        error
      );

      this.loading.set(false);

      return;
    }

    this.courses.set(data || []);

    this.loading.set(false);
  }


  // ADD COURSE

  openAddCourse() {

    this.editMode.set(false);
    this.editingCourseId = '';

    this.courseName = '';
    this.description = '';
    this.icon = '📚';
    this.level = 'BEGINNER';
    this.duration = '0 Hours';
    this.rating = 5.0;
    this.published = true;

    this.showForm.set(true);
  }


  // EDIT COURSE

  openEditCourse(course: any) {

    this.editMode.set(true);

    this.editingCourseId = course.id;

    this.courseName = course.name || '';
    this.description = course.description || '';
    this.icon = course.icon || '📚';
    this.level = course.level || 'BEGINNER';
    this.duration = course.duration || '0 Hours';
    this.rating = Number(course.rating) || 5.0;
    this.published = course.published ?? true;

    this.showForm.set(true);
  }


  // CLOSE FORM

  closeAddCourse() {

    if (this.saving()) {
      return;
    }

    this.showForm.set(false);
  }


  // SAVE / UPDATE COURSE

  async saveCourse() {

    if (
      !this.courseName.trim() ||
      !this.description.trim()
    ) {

      alert(
        'Please enter course name and description.'
      );

      return;
    }


    this.saving.set(true);

    const client =
      this.supabaseService.getClient();


    // UPDATE EXISTING COURSE

    if (this.editMode()) {

      const { data, error } =
        await client
          .from('courses')
          .update({
            name: this.courseName.trim(),
            description: this.description.trim(),
            icon: this.icon.trim() || '📚',
            level: this.level,
            duration:
              this.duration.trim() || '0 Hours',
            rating: Number(this.rating) || 5.0,
            published: this.published
          })
          .eq('id', this.editingCourseId)
          .select()
          .single();


      if (error) {

        console.error(
          'Course update error:',
          error
        );

        alert(
          'Course update nahi hoya. Console check karo.'
        );

        this.saving.set(false);

        return;
      }


      console.log(
        'Course updated:',
        data
      );


      alert(
        'Course successfully updated! ✅'
      );

    }


    // INSERT NEW COURSE

    else {

      const { data, error } =
        await client
          .from('courses')
          .insert({
            name: this.courseName.trim(),
            description: this.description.trim(),
            icon: this.icon.trim() || '📚',
            level: this.level,
            duration:
              this.duration.trim() || '0 Hours',
            rating: Number(this.rating) || 5.0,
            published: this.published
          })
          .select()
          .single();


      if (error) {

        console.error(
          'Course insert error:',
          error
        );

        alert(
          'Course save nahi hoya. Console check karo.'
        );

        this.saving.set(false);

        return;
      }


      console.log(
        'Course created:',
        data
      );


      alert(
        'Course successfully added! ✅'
      );
    }


    this.saving.set(false);

    this.showForm.set(false);

    this.editMode.set(false);

    this.editingCourseId = '';

    await this.loadCourses();
  }


  // DELETE COURSE

  async deleteCourse(course: any) {

    const courseName =
      course.name || 'this course';


    const confirmed =
      confirm(
        `Are you sure you want to delete "${courseName}"?`
      );


    if (!confirmed) {
      return;
    }


    this.deleting.set(true);


    const client =
      this.supabaseService.getClient();


    const { error } =
      await client
        .from('courses')
        .delete()
        .eq('id', course.id);


    if (error) {

      console.error(
        'Course delete error:',
        error
      );

      alert(
        'Course delete nahi hoya. Console check karo.'
      );

      this.deleting.set(false);

      return;
    }


    alert(
      'Course successfully deleted! ✅'
    );


    this.deleting.set(false);

    await this.loadCourses();
  }

  async togglePublish(course: any) {

  const newStatus = !course.published;

  const client =
    this.supabaseService.getClient();

  const { error } =
    await client
      .from('courses')
      .update({
        published: newStatus
      })
      .eq('id', course.id);

  if (error) {

    console.error(
      'Course publish update error:',
      error
    );

    alert(
      'Course status update nahi hoya.'
    );

    return;
  }

  console.log(
    'Course status updated:',
    newStatus
  );

  await this.loadCourses();
}

}