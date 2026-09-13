import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-admin-students',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-students.html',
  styleUrl: './admin-students.css'
})
export class AdminStudents {

  students = signal<any[]>([]);
  loading = signal(true);
  searchText = '';

  selectedStudent = signal<any>(null);
  studentProgress = signal<any[]>([]);
  detailsLoading = signal(false);
  showDetails = signal(false);

  constructor(private supabaseService: Supabase) {
    this.loadStudents();
  }

  async loadStudents() {

    this.loading.set(true);

    try {

      const client = this.supabaseService.getClient();

      const { data, error } = await client
  .from('students')
  .select('id, full_name, email, role, created_at')
  .eq('role', 'student')
  .order('created_at', { ascending: false });
      if (error) {

        console.error(
          'Students loading error:',
          error
        );

        return;
      }

      console.log(
        'Students:',
        data
      );

      this.students.set(data || []);

    } catch (error) {

      console.error(
        'Students loading exception:',
        error
      );

    } finally {

      this.loading.set(false);

    }
  }


  get filteredStudents() {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {

      return this.students();

    }

    return this.students().filter(student =>

      (student.full_name || '')
        .toLowerCase()
        .includes(search)

      ||

      (student.email || '')
        .toLowerCase()
        .includes(search)

    );
  }


  async viewStudent(student: any) {

    this.selectedStudent.set(student);

    this.studentProgress.set([]);

    this.showDetails.set(true);

    this.detailsLoading.set(true);

    try {

      const client =
        this.supabaseService.getClient();


      /*
        Get student's course progress
      */

      const { data: progressData, error: progressError } =
        await client
          .from('student_progress')
          .select(
            'course_name, completed_lessons, updated_at'
          )
          .eq(
            'student_id',
            student.id
          );


      if (progressError) {

        console.error(
          'Student progress loading error:',
          progressError
        );

        return;
      }


      /*
        Get all courses
      */

      const { data: coursesData, error: coursesError } =
        await client
          .from('courses')
          .select('id, name');


      if (coursesError) {

        console.error(
          'Courses loading error:',
          coursesError
        );

        return;
      }


      /*
        Get lesson counts
      */

      const { data: lessonsData, error: lessonsError } =
        await client
          .from('lessons')
          .select('course_id');


      if (lessonsError) {

        console.error(
          'Lessons loading error:',
          lessonsError
        );

        return;
      }


      /*
        Create progress list
      */

      const progressList =
        (progressData || []).map(progress => {

          const course =
            (coursesData || []).find(
              course =>
                course.name === progress.course_name
            );

          const totalLessons =
            (lessonsData || []).filter(
              lesson =>
                lesson.course_id === course?.id
            ).length;

          const completedLessons =
            Array.isArray(
              progress.completed_lessons
            )
              ? progress.completed_lessons.length
              : 0;

          const percentage =
            totalLessons > 0
              ? Math.min(
                  100,
                  (completedLessons / totalLessons) * 100
                )
              : 0;

          return {

            courseName:
              progress.course_name,

            completedLessons,

            totalLessons,

            percentage,

            updatedAt:
              progress.updated_at

          };

        });


      this.studentProgress.set(
        progressList
      );


      console.log(
        'Selected student:',
        student
      );

      console.log(
        'Student progress:',
        progressList
      );

    } catch (error) {

      console.error(
        'Student details exception:',
        error
      );

    } finally {

      this.detailsLoading.set(false);

    }
  }


  closeDetails() {

    this.showDetails.set(false);

    this.selectedStudent.set(null);

    this.studentProgress.set([]);

  }


  formatDate(date: string) {

    if (!date) return '-';

    return new Date(date)
      .toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );

  }


  formatProgress(progress: number) {

    return Math.round(progress);

  }

}