import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-certificates',
  imports: [RouterLink],
  templateUrl: './certificates.html',
  styleUrl: './certificates.css'
})
export class Certificates {

  // =========================================
  // CERTIFICATES
  // =========================================

  earnedCertificates = signal<any[]>([]);
  pendingCertificates = signal<any[]>([]);
  rejectedCertificates = signal<any[]>([]);

  // =========================================
  // COURSES
  // =========================================

  courses = signal<any[]>([]);

  loadingCourses = signal(true);
  loadingCertificates = signal(true);

  // =========================================
  // ICONS
  // =========================================

  courseIcons: Record<string, string> = {
    'Canva Mastery': '🎨',
    'Video Editing': '🎬',
    'Web Development': '💻',
    'AI Tools': '🤖',
    'Digital Marketing': '📱',
    'SEO': '🔎'
  };

  constructor(
    private auth: Auth,
    private supabaseService: Supabase
  ) {

    this.loadCertificates();
    this.loadCourses();

  }

  // =========================================
  // LOAD CERTIFICATES
  // =========================================

  async loadCertificates() {

    this.loadingCertificates.set(true);

    try {

      const sessionResult =
        await this.auth.getSession();

      const user =
        sessionResult.data.session?.user;

      if (!user) {

        console.log(
          'No logged in user.'
        );

        return;
      }

      const client =
        this.supabaseService.getClient();

      const {
        data,
        error
      } = await client
        .from('certificates')
        .select(
          'id, student_id, course_name, status, requested_at, approved_at'
        )
        .eq(
          'student_id',
          user.id
        )
        .order(
          'requested_at',
          {
            ascending: false
          }
        );

      if (error) {

        console.error(
          'Certificates error:',
          error
        );

        return;
      }

      const certificates =
        data || [];

      console.log(
        'Certificates:',
        certificates
      );

      // APPROVED
      this.earnedCertificates.set(
        certificates
          .filter(
            certificate =>
              certificate.status === 'approved'
          )
          .map(
            certificate => ({

              id:
                certificate.id,

              course:
                certificate.course_name,

              status:
                'Approved',

              date:
                this.formatDate(
                  certificate.approved_at
                ),

              certificateId:
                certificate.id,

              requestedAt:
                this.formatDate(
                  certificate.requested_at
                ),

              approvedAt:
                this.formatDate(
                  certificate.approved_at
                )

            })
          )
      );

      // PENDING
      this.pendingCertificates.set(
        certificates
          .filter(
            certificate =>
              certificate.status === 'pending'
          )
          .map(
            certificate => ({

              id:
                certificate.id,

              course:
                certificate.course_name,

              status:
                'Pending',

              requestedAt:
                this.formatDate(
                  certificate.requested_at
                )

            })
          )
      );

      // REJECTED
      this.rejectedCertificates.set(
        certificates
          .filter(
            certificate =>
              certificate.status === 'rejected'
          )
          .map(
            certificate => ({

              id:
                certificate.id,

              course:
                certificate.course_name,

              status:
                'Rejected',

              requestedAt:
                this.formatDate(
                  certificate.requested_at
                )

            })
          )
      );

    } catch (error) {

      console.error(
        'Certificates exception:',
        error
      );

    } finally {

      this.loadingCertificates.set(false);

    }

  }

  // =========================================
  // LOAD COURSES
  // =========================================

  async loadCourses() {

    this.loadingCourses.set(true);

    try {

      const client =
        this.supabaseService.getClient();

      console.log(
        'Loading published courses...'
      );

      const {
        data: coursesData,
        error: coursesError
      } = await client
        .from('courses')
        .select(
          'id, name, description, icon, level, duration, published'
        )
        .eq(
          'published',
          true
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        );

      if (coursesError) {

        console.error(
          'Courses error:',
          coursesError
        );

        return;
      }

      const courses =
        coursesData || [];

      console.log(
        'Published courses:',
        courses
      );

      const sessionResult =
        await this.auth.getSession();

      const user =
        sessionResult.data.session?.user;

      const courseList: any[] = [];

      for (
        const course of courses
      ) {

        // TOTAL LESSONS
        const {
          count,
          error: lessonError
        } = await client
          .from('lessons')
          .select(
            'id',
            {
              count: 'exact',
              head: true
            }
          )
          .eq(
            'course_id',
            course.id
          );

        if (lessonError) {

          console.error(
            'Lesson count error:',
            lessonError
          );

        }

        const totalLessons =
          count || 0;

        // COMPLETED LESSONS
        let completedLessons = 0;

        if (user) {

          const {
            data: progressData,
            error: progressError
          } = await client
            .from('student_progress')
            .select(
              'completed_lessons'
            )
            .eq(
              'student_id',
              user.id
            )
            .eq(
              'course_name',
              course.name
            )
            .maybeSingle();

          if (progressError) {

            console.error(
              'Progress error:',
              progressError
            );

          } else if (
            progressData &&
            Array.isArray(
              progressData.completed_lessons
            )
          ) {

            completedLessons =
              progressData
                .completed_lessons
                .length;

          }

        }

        // PROGRESS
        let progress = 0;

        if (
          totalLessons > 0
        ) {

          progress =
            Math.round(
              (
                completedLessons /
                totalLessons
              ) * 100
            );

          progress =
            Math.min(
              100,
              progress
            );

        }

        courseList.push({

          id:
            course.id,

          name:
            course.name,

          description:
            course.description,

          icon:
            course.icon ||
            this.getCourseIcon(
              course.name
            ),

          level:
            course.level,

          duration:
            course.duration,

          totalLessons:
            totalLessons,

          completedLessons:
            completedLessons,

          progress:
            progress

        });

      }

      console.log(
        'Final courses:',
        courseList
      );

      this.courses.set(
        courseList
      );

    } catch (error) {

      console.error(
        'Courses exception:',
        error
      );

    } finally {

      this.loadingCourses.set(false);

    }

  }

  // =========================================
  // ICON
  // =========================================

  getCourseIcon(
    courseName: string
  ): string {

    return (
      this.courseIcons[courseName] ||
      '📚'
    );

  }

  // =========================================
  // STATUS
  // =========================================

  isPending(
    courseName: string
  ): boolean {

    return this.pendingCertificates().some(
      certificate =>
        certificate.course ===
        courseName
    );

  }

  isEarned(
    courseName: string
  ): boolean {

    return this.earnedCertificates().some(
      certificate =>
        certificate.course ===
        courseName
    );

  }

  isRejected(
    courseName: string
  ): boolean {

    return this.rejectedCertificates().some(
      certificate =>
        certificate.course ===
        courseName
    );

  }

  // =========================================
  // REQUEST CERTIFICATE
  // =========================================

  async requestCertificate(
    courseName: string
  ) {

    const course =
      this.courses().find(
        item =>
          item.name === courseName
      );

    if (!course) {

      alert(
        'Course information not found.'
      );

      return;
    }

    if (
      course.progress < 100
    ) {

      alert(
        `Please complete all ${course.totalLessons} lessons first.`
      );

      return;
    }

    if (
      this.isEarned(
        courseName
      )
    ) {

      alert(
        'Certificate already approved.'
      );

      return;
    }

    if (
      this.isPending(
        courseName
      )
    ) {

      alert(
        'Certificate request is already pending.'
      );

      return;
    }

    try {

      const sessionResult =
        await this.auth.getSession();

      const user =
        sessionResult.data.session?.user;

      if (!user) {

        alert(
          'Please login first.'
        );

        return;
      }

      const client =
        this.supabaseService.getClient();

      const {
        data: existing,
        error: checkError
      } = await client
        .from('certificates')
        .select(
          'id, status'
        )
        .eq(
          'student_id',
          user.id
        )
        .eq(
          'course_name',
          courseName
        )
        .maybeSingle();

      if (checkError) {

        console.error(
          'Certificate check error:',
          checkError
        );

        alert(
          'Certificate check failed.'
        );

        return;
      }

      if (existing) {

        if (
          existing.status ===
          'approved'
        ) {

          alert(
            'Certificate already approved.'
          );

          await this.loadCertificates();

          return;
        }

        if (
          existing.status ===
          'pending'
        ) {

          alert(
            'Certificate request is already pending.'
          );

          await this.loadCertificates();

          return;
        }

      }

      const {
        data,
        error
      } = await client
        .from('certificates')
        .insert({

          student_id:
            user.id,

          course_name:
            courseName,

          status:
            'pending'

        })
        .select()
        .single();

      if (error) {

        console.error(
          'Certificate insert error:',
          error
        );

        alert(
          'Certificate request nahi hoyi.'
        );

        return;
      }

      console.log(
        'Certificate created:',
        data
      );

      alert(
        'Certificate request successfully sent! 🏆'
      );

      await this.loadCertificates();

    } catch (error) {

      console.error(
        'Certificate request exception:',
        error
      );

      alert(
        'Certificate request nahi hoyi.'
      );

    }

  }

  // =========================================
  // DATE
  // =========================================

  formatDate(
    date: string | null
  ): string {

    if (!date) {
      return '-';
    }

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

}