import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certificates',
  imports: [RouterLink],
  templateUrl: './certificates.html',
  styleUrl: './certificates.css'
})
export class Certificates {

  earnedCertificates: any[] = [];

  pendingCertificates: any[] = [];

  upcomingCertificates = [
    {
      icon: '🎨',
      course: 'Canva Mastery',
      progress: 0
    },
    {
      icon: '🎬',
      course: 'Video Editing',
      progress: 0
    },
    {
      icon: '💻',
      course: 'Web Development',
      progress: 0
    },
    {
      icon: '🤖',
      course: 'AI Tools',
      progress: 0
    }
  ];

  constructor() {
    this.loadCertificates();
  }

  loadCertificates() {

    if (typeof localStorage === 'undefined') {
      return;
    }

    const earned =
      localStorage.getItem(
        'skillkamao-earned-certificates'
      );

    const pending =
      localStorage.getItem(
        'skillkamao-pending-certificates'
      );

    if (earned) {
      this.earnedCertificates =
        JSON.parse(earned);
    }

    if (pending) {
      this.pendingCertificates =
        JSON.parse(pending);
    }

  }


  getCourseProgress(courseName: string): number {

    if (typeof localStorage === 'undefined') {
      return 0;
    }

    const savedProgress =
      localStorage.getItem(
        `progress-${courseName}`
      );

    if (!savedProgress) {
      return 0;
    }

    const completedLessons: number[] =
      JSON.parse(savedProgress);

    const totalLessons = 4;

    return Math.round(
      (completedLessons.length /
        totalLessons) * 100
    );

  }


  isPending(courseName: string): boolean {

    return this.pendingCertificates.some(
      certificate =>
        certificate.course === courseName
    );

  }


  requestCertificate(
    courseName: string,
    icon: string
  ) {

    const progress =
      this.getCourseProgress(courseName);

    // Course must be 100% complete
    if (progress < 100) {
      return;
    }

    const alreadyPending =
      this.pendingCertificates.some(
        certificate =>
          certificate.course === courseName
      );

    const alreadyEarned =
      this.earnedCertificates.some(
        certificate =>
          certificate.course === courseName
      );

    if (
      alreadyPending ||
      alreadyEarned
    ) {
      return;
    }

    const request = {

      icon: icon,

      course: courseName,

      requestedAt:
        new Date().toLocaleDateString(),

      status: 'Pending'

    };

    this.pendingCertificates.push(request);

    localStorage.setItem(
      'skillkamao-pending-certificates',
      JSON.stringify(
        this.pendingCertificates
      )
    );

  }

}