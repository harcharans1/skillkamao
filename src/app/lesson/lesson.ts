import {
  Component,
  ElementRef,
  ViewChild,
  signal
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { Auth } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-lesson',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './lesson.html',
  styleUrl: './lesson.css'
})
export class Lesson {

  @ViewChild('videoPlayer')
  videoPlayer!: ElementRef<HTMLVideoElement>;

  course = signal<any>(null);

  lessons = signal<any[]>([]);

  courseName = '';

  currentLesson = 1;

  totalLessons = 0;

  completed = false;

  progress = 0;

  videoPlaying = false;

  videoProgress = 0;

  videoDuration = 0;

  completedLessons: number[] = [];


  constructor(
    private route: ActivatedRoute,
    private auth: Auth,
    private supabaseService: Supabase
  ) {

    this.courseName =
      this.route.snapshot.paramMap.get('courseName') || '';

    this.loadCourse();

  }


  /* ================================
     CURRENT LESSON
  ================================= */

  get currentLessonData() {

    return this.lessons()
      .find(
        lesson =>
          lesson.lesson_number === this.currentLesson
      );

  }


  /* ================================
     LOAD COURSE
  ================================= */

  async loadCourse() {

    if (!this.courseName) {

      console.error(
        'Course name missing from URL'
      );

      return;

    }

    const client =
      this.supabaseService.getClient();


    const { data, error } =
      await client
        .from('courses')
        .select('*')
        .eq('name', this.courseName)
        .eq('published', true)
        .single();


    if (error) {

      console.error(
        'Course loading error:',
        error
      );

      return;

    }


    this.course.set(data);


    console.log(
      'Course loaded:',
      data
    );


    await this.loadLessons(data.id);

    await this.loadProgress();

  }


  /* ================================
     LOAD LESSONS FROM SUPABASE
  ================================= */

  async loadLessons(courseId: string) {

    const client =
      this.supabaseService.getClient();


    const { data, error } =
      await client
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order(
          'lesson_number',
          { ascending: true }
        );


    if (error) {

      console.error(
        'Lessons loading error:',
        error
      );

      return;

    }


    this.lessons.set(data || []);

    this.totalLessons =
      data?.length || 0;


    console.log(
      'Lessons loaded from Supabase:',
      data
    );

  }


  /* ================================
     MARK COMPLETE
  ================================= */

  async markComplete() {

    if (
      !this.completedLessons.includes(
        this.currentLesson
      )
    ) {

      this.completedLessons.push(
        this.currentLesson
      );

    }


    this.completed = true;

    this.updateProgress();

    await this.saveProgress();

  }


  /* ================================
     NEXT LESSON
  ================================= */

  nextLesson() {

    if (
      this.currentLesson <
      this.totalLessons
    ) {

      this.currentLesson++;

      this.completed =
        this.completedLessons.includes(
          this.currentLesson
        );

      this.resetVideo();

    }

  }


  /* ================================
     PREVIOUS LESSON
  ================================= */

  previousLesson() {

    if (this.currentLesson > 1) {

      this.currentLesson--;

      this.completed =
        this.completedLessons.includes(
          this.currentLesson
        );

      this.resetVideo();

    }

  }


  /* ================================
     SELECT LESSON
  ================================= */

  selectLesson(
    lessonNumber: number
  ) {

    this.currentLesson =
      lessonNumber;

    this.completed =
      this.completedLessons.includes(
        lessonNumber
      );

    this.resetVideo();

  }


  /* ================================
     UPDATE COURSE PROGRESS
  ================================= */

  updateProgress() {

    if (this.totalLessons === 0) {

      this.progress = 0;

      return;

    }


    this.progress =
      (
        this.completedLessons.length /
        this.totalLessons
      ) * 100;

  }


  /* ================================
     SAVE PROGRESS
  ================================= */

  async saveProgress() {

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


      const {
        data: existingProgress,
        error: selectError
      } =
        await client
          .from('student_progress')
          .select('id')
          .eq(
            'student_id',
            user.id
          )
          .eq(
            'course_name',
            this.courseName
          )
          .maybeSingle();


      if (selectError) {

        console.error(
          'Progress check error:',
          selectError
        );

        return;

      }


      if (existingProgress) {

        const { error } =
          await client
            .from('student_progress')
            .update({

              completed_lessons:
                this.completedLessons,

              updated_at:
                new Date().toISOString()

            })
            .eq(
              'id',
              existingProgress.id
            );


        if (error) {

          console.error(
            'Progress update error:',
            error
          );

          return;

        }

      } else {

        const { error } =
          await client
            .from('student_progress')
            .insert({

              student_id:
                user.id,

              course_name:
                this.courseName,

              completed_lessons:
                this.completedLessons

            });


        if (error) {

          console.error(
            'Progress insert error:',
            error
          );

          return;

        }

      }


      console.log(
        'Progress saved to Supabase ✅'
      );

    } catch (error) {

      console.error(
        'Progress save error:',
        error
      );

    }

  }


  /* ================================
     LOAD PROGRESS
  ================================= */

  async loadProgress() {

    try {

      const sessionResult =
        await this.auth.getSession();


      const user =
        sessionResult.data.session?.user;


      if (!user) {

        this.loadLocalProgress();

        return;

      }


      const client =
        this.supabaseService.getClient();


      const { data, error } =
        await client
          .from('student_progress')
          .select('completed_lessons')
          .eq(
            'student_id',
            user.id
          )
          .eq(
            'course_name',
            this.courseName
          )
          .maybeSingle();


      if (error) {

        console.error(
          'Progress load error:',
          error
        );

        this.loadLocalProgress();

        return;

      }


      if (data) {

        this.completedLessons =
          Array.isArray(
            data.completed_lessons
          )
            ? data.completed_lessons
            : [];


        this.updateProgress();


        this.completed =
          this.completedLessons.includes(
            this.currentLesson
          );


        console.log(
          'Progress loaded from Supabase ✅'
        );

      } else {

        this.completedLessons = [];

        this.updateProgress();

        this.completed = false;

      }

    } catch (error) {

      console.error(
        'Progress loading error:',
        error
      );

      this.loadLocalProgress();

    }

  }


  /* ================================
     LOCAL STORAGE FALLBACK
  ================================= */

  loadLocalProgress() {

    if (
      typeof localStorage ===
      'undefined'
    ) {

      return;

    }


    const savedProgress =
      localStorage.getItem(
        `progress-${this.courseName}`
      );


    if (savedProgress) {

      this.completedLessons =
        JSON.parse(savedProgress);


      this.updateProgress();


      this.completed =
        this.completedLessons.includes(
          this.currentLesson
        );

    }

  }


  /* ================================
     VIDEO PLAY / PAUSE
  ================================= */

  toggleVideo() {

    const video =
      this.videoPlayer.nativeElement;


    if (video.paused) {

      video.play();

      this.videoPlaying = true;

    } else {

      video.pause();

      this.videoPlaying = false;

    }

  }


  /* ================================
     SEEK
  ================================= */

  seek(seconds: number) {

    const video =
      this.videoPlayer.nativeElement;


    video.currentTime += seconds;

  }


  /* ================================
     VIDEO PROGRESS
  ================================= */

  updateVideoProgress() {

    const video =
      this.videoPlayer.nativeElement;


    if (video.duration) {

      this.videoProgress =
        (
          video.currentTime /
          video.duration
        ) * 100;

    }

  }


  /* ================================
     VIDEO RANGE
  ================================= */

  setVideoProgress(event: Event) {

    const input =
      event.target as HTMLInputElement;


    const video =
      this.videoPlayer.nativeElement;


    video.currentTime =
      (
        Number(input.value) /
        100
      ) * video.duration;

  }


  /* ================================
     VIDEO DURATION
  ================================= */

  setDuration() {

    const video =
      this.videoPlayer.nativeElement;


    this.videoDuration =
      video.duration;

  }


  /* ================================
     FULLSCREEN
  ================================= */

  toggleFullscreen() {

    const videoContainer =
      this.videoPlayer.nativeElement
        .parentElement;


    if (document.fullscreenElement) {

      document.exitFullscreen();

    } else {

      videoContainer?.requestFullscreen();

    }

  }


  /* ================================
     RESET VIDEO
  ================================= */

  resetVideo() {

    setTimeout(() => {

      if (this.videoPlayer) {

        const video =
          this.videoPlayer.nativeElement;


        video.pause();

        video.currentTime = 0;

        this.videoPlaying = false;

        this.videoProgress = 0;

      }

    });

  }

}