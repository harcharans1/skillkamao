import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-admin-lessons',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-lessons.html',
  styleUrl: './admin-lessons.css'
})
export class AdminLessons {

  // ================================
  // DATA
  // ================================

  course = signal<any>(null);
  lessons = signal<any[]>([]);

  loading = signal(true);
  showForm = signal(false);

  saving = signal(false);
  deleting = signal(false);
  uploadingVideo = signal(false);

  // ================================
  // EDIT MODE
  // ================================

  editMode = signal(false);
  editingLessonId = '';

  // ================================
  // COURSE
  // ================================

  courseId = '';

  // ================================
  // FORM DATA
  // ================================

  lessonNumber = 1;
  title = '';
  duration = '0 min';
  videoUrl = '';

  // Selected video file
  selectedVideo: File | null = null;


  constructor(
    private route: ActivatedRoute,
    private supabaseService: Supabase
  ) {

    this.courseId =
      this.route.snapshot.paramMap.get('courseId') || '';

    this.loadCourse();
  }


  // ================================
  // LOAD COURSE
  // ================================

  async loadCourse() {

    if (!this.courseId) {

      console.error(
        'Course ID missing from URL'
      );

      this.loading.set(false);

      return;
    }


    const client =
      this.supabaseService.getClient();


    const {
      data: courseData,
      error: courseError
    } = await client
      .from('courses')
      .select('*')
      .eq('id', this.courseId)
      .single();


    if (courseError) {

      console.error(
        'Admin course loading error:',
        courseError
      );

      this.loading.set(false);

      return;
    }


    this.course.set(courseData);


    await this.loadLessons();


    this.loading.set(false);
  }


  // ================================
  // LOAD LESSONS
  // ================================

  async loadLessons() {

    const client =
      this.supabaseService.getClient();


    const {
      data,
      error
    } = await client
      .from('lessons')
      .select('*')
      .eq('course_id', this.courseId)
      .order('lesson_number', {
        ascending: true
      });


    if (error) {

      console.error(
        'Admin lessons loading error:',
        error
      );

      return;
    }


    console.log(
      'Admin lessons:',
      data
    );


    this.lessons.set(
      data || []
    );
  }


  // ================================
  // ADD LESSON
  // ================================

  openAddLesson() {

    this.editMode.set(false);

    this.editingLessonId = '';


    this.lessonNumber =
      this.lessons().length + 1;

    this.title = '';

    this.duration =
      '0 min';

    this.videoUrl =
      '';

    this.selectedVideo =
      null;


    this.showForm.set(true);
  }


  // ================================
  // EDIT LESSON
  // ================================

  openEditLesson(lesson: any) {

    this.editMode.set(true);

    this.editingLessonId =
      lesson.id;


    this.lessonNumber =
      Number(lesson.lesson_number) || 1;

    this.title =
      lesson.title || '';

    this.duration =
      lesson.duration || '0 min';

    this.videoUrl =
      lesson.video_url || '';


    this.selectedVideo =
      null;


    this.showForm.set(true);
  }


  // ================================
  // CLOSE FORM
  // ================================

  closeLessonForm() {

    if (this.saving()) {
      return;
    }


    if (this.uploadingVideo()) {
      return;
    }


    this.showForm.set(false);

    this.selectedVideo =
      null;
  }


  // ================================
  // VIDEO SELECT
  // ================================

  onVideoSelected(event: Event) {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedVideo =
        null;

      return;
    }


    const file =
      input.files[0];


    // Check video

    if (!file.type.startsWith('video/')) {

      alert(
        'Please select a valid video file.'
      );

      input.value = '';

      this.selectedVideo =
        null;

      return;
    }


    // Optional size limit
    // 500 MB

    const maxSize =
      500 * 1024 * 1024;


    if (file.size > maxSize) {

      alert(
        'Video size must be less than 500 MB.'
      );

      input.value = '';

      this.selectedVideo =
        null;

      return;
    }


    this.selectedVideo =
      file;


    console.log(
      'Selected video:',
      file.name
    );
  }


  // ================================
  // UPLOAD VIDEO
  // ================================

  async uploadVideo() {

    if (!this.selectedVideo) {

      alert(
        'Please select a video first.'
      );

      return;
    }


    this.uploadingVideo.set(true);


    try {

      const client =
        this.supabaseService.getClient();


      const file =
        this.selectedVideo;


      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'mp4';


      const safeFileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${extension}`;


      const filePath =
        `${this.courseId}/${safeFileName}`;


      console.log(
        'Uploading video:',
        filePath
      );


      // Upload

      const {
        error: uploadError
      } = await client.storage
        .from('course-videos')
        .upload(
          filePath,
          file,
          {
            cacheControl: '3600',
            upsert: false
          }
        );


      if (uploadError) {

        console.error(
          'Video upload error:',
          uploadError
        );

        alert(
          'Video upload nahi hoya. Console check karo.'
        );

        return;
      }


      // Get public URL

      const {
        data: publicUrlData
      } = client.storage
        .from('course-videos')
        .getPublicUrl(
          filePath
        );


      if (
        !publicUrlData ||
        !publicUrlData.publicUrl
      ) {

        alert(
          'Video upload ho gaya, par URL nahi mil reha.'
        );

        return;
      }


      this.videoUrl =
        publicUrlData.publicUrl;


      console.log(
        'Video URL:',
        this.videoUrl
      );


      alert(
        'Video successfully uploaded! ✅'
      );


      // Clear selected file

      this.selectedVideo =
        null;

    } catch (error) {

      console.error(
        'Video upload exception:',
        error
      );

      alert(
        'Video upload nahi hoya.'
      );

    } finally {

      this.uploadingVideo.set(false);
    }
  }


  // ================================
  // SAVE / UPDATE LESSON
  // ================================

  async saveLesson() {

    if (!this.title.trim()) {

      alert(
        'Please enter lesson title.'
      );

      return;
    }


    if (
      !this.lessonNumber ||
      Number(this.lessonNumber) < 1
    ) {

      alert(
        'Lesson number must be 1 or greater.'
      );

      return;
    }


    if (
      this.lessonNumber >
      999
    ) {

      alert(
        'Lesson number is too large.'
      );

      return;
    }


    this.saving.set(true);


    try {

      const client =
        this.supabaseService.getClient();


      // ============================
      // UPDATE LESSON
      // ============================

      if (this.editMode()) {

        const {
          data,
          error
        } = await client
          .from('lessons')
          .update({

            lesson_number:
              Number(this.lessonNumber),

            title:
              this.title.trim(),

            duration:
              this.duration.trim() ||
              '0 min',

            video_url:
              this.videoUrl.trim() ||
              null

          })
          .eq(
            'id',
            this.editingLessonId
          )
          .select()
          .single();


        if (error) {

          console.error(
            'Lesson update error:',
            error
          );

          alert(
            'Lesson update nahi hoya. Console check karo.'
          );

          return;
        }


        console.log(
          'Lesson updated:',
          data
        );


        alert(
          'Lesson successfully updated! ✅'
        );

      }


      // ============================
      // INSERT LESSON
      // ============================

      else {

        const {
          data,
          error
        } = await client
          .from('lessons')
          .insert({

            course_id:
              this.courseId,

            lesson_number:
              Number(this.lessonNumber),

            title:
              this.title.trim(),

            duration:
              this.duration.trim() ||
              '0 min',

            video_url:
              this.videoUrl.trim() ||
              null

          })
          .select()
          .single();


        if (error) {

          console.error(
            'Lesson insert error:',
            error
          );

          alert(
            'Lesson save nahi hoya. Console check karo.'
          );

          return;
        }


        console.log(
          'Lesson created:',
          data
        );


        alert(
          'Lesson successfully added! ✅'
        );
      }


      // Reset

      this.showForm.set(false);

      this.editMode.set(false);

      this.editingLessonId =
        '';

      this.selectedVideo =
        null;


      await this.loadLessons();

    } catch (error) {

      console.error(
        'Lesson save exception:',
        error
      );

      alert(
        'Lesson save nahi hoya.'
      );

    } finally {

      this.saving.set(false);
    }
  }


  // ================================
  // DELETE LESSON
  // ================================

  async deleteLesson(lesson: any) {

    const lessonTitle =
      lesson.title ||
      'this lesson';


    const confirmed =
      confirm(
        `Are you sure you want to delete "${lessonTitle}"?`
      );


    if (!confirmed) {
      return;
    }


    this.deleting.set(true);


    try {

      const client =
        this.supabaseService.getClient();


      const {
        error
      } = await client
        .from('lessons')
        .delete()
        .eq(
          'id',
          lesson.id
        );


      if (error) {

        console.error(
          'Lesson delete error:',
          error
        );

        alert(
          'Lesson delete nahi hoya. Console check karo.'
        );

        return;
      }


      alert(
        'Lesson successfully deleted! ✅'
      );


      await this.loadLessons();

    } catch (error) {

      console.error(
        'Lesson delete exception:',
        error
      );

      alert(
        'Lesson delete nahi hoya.'
      );

    } finally {

      this.deleting.set(false);
    }
  }

}