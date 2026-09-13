import {
  Component,
  HostListener,
  signal
} from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Auth } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  studentName = signal('Student');

  overallProgress = signal(0);

  courses = signal<any[]>([]);

  stats = signal([
    { icon: '📚', number: '0', label: 'My Courses' },
    { icon: '🎯', number: '0', label: 'Skills Learning' },
    { icon: '🏆', number: '0', label: 'Completed' },
    { icon: '⏱️', number: '0h', label: 'Learning Time' }
  ]);

  continueCourse = signal<any>(null);


  constructor(
    private auth: Auth,
    private supabaseService: Supabase
  ) {

    this.loadDashboard();

  }


  /* ================================
     LOAD DASHBOARD
  ================================= */

  async loadDashboard() {

    await this.loadUser();

    await this.loadCourses();

  }


  /* ================================
     LOAD USER
  ================================= */

  async loadUser() {

    try {

      const sessionResult =
        await this.auth.getSession();

      const user =
        sessionResult.data.session?.user;

      if (!user) {
        return;
      }

      const client =
        this.supabaseService.getClient();

      const { data, error } =
        await client
          .from('students')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

      if (error) {

        console.error(
          'Student profile error:',
          error
        );

        return;

      }

      if (data?.full_name) {

        this.studentName.set(
          data.full_name
        );

      }

    } catch (error) {

      console.error(
        'User loading error:',
        error
      );

    }

  }


  /* ================================
     LOAD COURSES + PROGRESS
  ================================= */

  async loadCourses() {

    try {

      const sessionResult =
        await this.auth.getSession();

      const user =
        sessionResult.data.session?.user;

      if (!user) {

        console.error(
          'User is not logged in.'
        );

        return;

      }

      const client =
        this.supabaseService.getClient();


      /* COURSES */

      const {
        data: coursesData,
        error: coursesError
      } =
        await client
          .from('courses')
          .select('*')
          .eq('published', true)
          .order(
            'created_at',
            { ascending: true }
          );


      if (coursesError) {

        console.error(
          'Courses loading error:',
          coursesError
        );

        return;

      }


      /* PROGRESS */

      const {
        data: progressData,
        error: progressError
      } =
        await client
          .from('student_progress')
          .select(
            'course_name, completed_lessons'
          )
          .eq(
            'student_id',
            user.id
          );


      if (progressError) {

        console.error(
          'Progress loading error:',
          progressError
        );

        return;

      }


      /* BUILD COURSE DATA */

      const dashboardCourses =
        (coursesData || []).map(
          course => {

            const progressRecord =
              (progressData || []).find(
                progress =>
                  progress.course_name ===
                  course.name
              );


            const completedLessons =
              Array.isArray(
                progressRecord?.completed_lessons
              )
                ? progressRecord.completed_lessons.length
                : 0;


            const totalLessons = 4;


            const progress =
              totalLessons > 0
                ? (
                    completedLessons /
                    totalLessons
                  ) * 100
                : 0;


            let lesson =
              'Lesson 1';


            if (
              completedLessons >=
              totalLessons
            ) {

              lesson =
                'Course Completed ✓';

            } else {

              lesson =
                `Lesson ${
                  completedLessons + 1
                }`;

            }


            return {

              icon:
                course.icon,

              name:
                course.name,

              progress,

              completedLessons,

              totalLessons,

              lesson

            };

          }
        );


      /* SET COURSES */

      this.courses.set(
        dashboardCourses
      );


      /* OVERALL PROGRESS */

      if (dashboardCourses.length > 0) {

        const totalProgress =
          dashboardCourses.reduce(
            (
              total,
              course
            ) =>
              total + course.progress,
            0
          );


        this.overallProgress.set(
          totalProgress /
          dashboardCourses.length
        );

      } else {

        this.overallProgress.set(0);

      }


      /* STATS */

      const completedCourses =
        dashboardCourses.filter(
          course =>
            course.progress === 100
        ).length;


      const learningCourses =
        dashboardCourses.filter(
          course =>
            course.progress > 0 &&
            course.progress < 100
        ).length;


      const currentStats = [
        {
          icon: '📚',
          number:
            dashboardCourses.length.toString(),
          label: 'My Courses'
        },
        {
          icon: '🎯',
          number:
            learningCourses.toString(),
          label: 'Skills Learning'
        },
        {
          icon: '🏆',
          number:
            completedCourses.toString(),
          label: 'Completed'
        },
        {
          icon: '⏱️',
          number: '0h',
          label: 'Learning Time'
        }
      ];


      this.stats.set(
        currentStats
      );


      /* CONTINUE LEARNING */

      const inProgress =
        dashboardCourses.find(
          course =>
            course.progress > 0 &&
            course.progress < 100
        );


      if (inProgress) {

        this.continueCourse.set({

          icon:
            inProgress.icon,

          name:
            inProgress.name,

          lesson:
            inProgress.lesson,

          progress:
            inProgress.progress,

          duration:
            'Continue Learning'

        });

      } else if (dashboardCourses.length > 0) {

        const firstCourse =
          dashboardCourses[0];


        this.continueCourse.set({

          icon:
            firstCourse.icon,

          name:
            firstCourse.name,

          lesson:
            firstCourse.lesson,

          progress:
            firstCourse.progress,

          duration:
            'Start Learning'

        });

      }


      console.log(
        'Dashboard courses:',
        dashboardCourses
      );

      console.log(
        'Dashboard progress:',
        progressData
      );

    } catch (error) {

      console.error(
        'Dashboard error:',
        error
      );

    }

  }


  /* ================================
     REFRESH
  ================================= */

  @HostListener('window:pageshow')
  refreshProgress() {

    this.loadDashboard();

  }

}