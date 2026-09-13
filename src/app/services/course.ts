import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  courses = [

    {
      icon: '🎨',
      level: 'BEGINNER',
      name: 'Canva Mastery',
      description:
        'Learn Canva from the basics and create professional designs.',
      lessons: 4,
      rating: 4.9,
      duration: '3 Hours',

      lessonList: [
        {
          title: 'Introduction to Canva',
          duration: '10 min',
          video: '/videos/canva-lesson-1.mp4'
        },
        {
          title: 'Canva Tools & Interface',
          duration: '15 min',
          video: '/videos/canva-lesson-2.mp4'
        },
        {
          title: 'Creating Your First Design',
          duration: '30 min',
          video: '/videos/canva-lesson-3.mp4'
        },
        {
          title: 'Final Canva Project',
          duration: '45 min',
          video: '/videos/canva-lesson-4.mp4'
        }
      ]
    },

    {
      icon: '🎬',
      level: 'BEGINNER',
      name: 'Video Editing',
      description:
        'Learn video editing and create engaging content for social media.',
      lessons: 4,
      rating: 4.8,
      duration: '5 Hours',

      lessonList: [
        {
          title: 'Introduction to Video Editing',
          duration: '10 min',
          video: '/videos/editing-lesson-1.mp4'
        },
        {
          title: 'Editing Tools & Timeline',
          duration: '20 min',
          video: '/videos/editing-lesson-2.mp4'
        },
        {
          title: 'Transitions & Effects',
          duration: '30 min',
          video: '/videos/editing-lesson-3.mp4'
        },
        {
          title: 'Create Your First Video',
          duration: '45 min',
          video: '/videos/editing-lesson-4.mp4'
        }
      ]
    },

    {
      icon: '💻',
      level: 'INTERMEDIATE',
      name: 'Web Development',
      description:
        'Learn HTML, CSS and JavaScript by building real websites.',
      lessons: 4,
      rating: 4.9,
      duration: '8 Hours',

      lessonList: [
        {
          title: 'Introduction to Web Development',
          duration: '15 min',
          video: '/videos/web-lesson-1.mp4'
        },
        {
          title: 'HTML Fundamentals',
          duration: '30 min',
          video: '/videos/web-lesson-2.mp4'
        },
        {
          title: 'CSS & Responsive Design',
          duration: '40 min',
          video: '/videos/web-lesson-3.mp4'
        },
        {
          title: 'JavaScript Basics',
          duration: '45 min',
          video: '/videos/web-lesson-4.mp4'
        }
      ]
    },

    {
      icon: '🤖',
      level: 'BEGINNER',
      name: 'AI Tools',
      description:
        'Learn useful AI tools and improve your productivity.',
      lessons: 4,
      rating: 4.9,
      duration: '4 Hours',

      lessonList: [
        {
          title: 'Introduction to AI Tools',
          duration: '10 min',
          video: '/videos/ai-lesson-1.mp4'
        },
        {
          title: 'AI Prompting Basics',
          duration: '20 min',
          video: '/videos/ai-lesson-2.mp4'
        },
        {
          title: 'Popular AI Tools',
          duration: '30 min',
          video: '/videos/ai-lesson-3.mp4'
        },
        {
          title: 'Build an AI Project',
          duration: '40 min',
          video: '/videos/ai-lesson-4.mp4'
        }
      ]
    }

  ];

  getCourses() {
    return this.courses;
  }

  getCourse(courseName: string) {
    return this.courses.find(
      course => course.name === courseName
    );
  }
}