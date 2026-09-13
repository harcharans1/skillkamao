import { Component } from '@angular/core';

@Component({
  selector: 'app-roadmaps',
  imports: [],
  templateUrl: './roadmaps.html',
  styleUrl: './roadmaps.css'
})
export class Roadmaps {

  roadmaps = [
    {
      icon: '🎨',
      title: 'Graphic Design',
      description: 'Learn design from beginner to professional level.',
      level: 'Beginner → Advanced',
      skills: ['Canva', 'Design Basics', 'Branding', 'Projects'],
      duration: '6 Weeks'
    },
    {
      icon: '🎬',
      title: 'Video Editing',
      description: 'Master video editing and create professional content.',
      level: 'Beginner → Advanced',
      skills: ['Editing Basics', 'Reels', 'YouTube', 'Projects'],
      duration: '8 Weeks'
    },
    {
      icon: '💻',
      title: 'Web Development',
      description: 'Build modern websites and become a web developer.',
      level: 'Beginner → Advanced',
      skills: ['HTML', 'CSS', 'JavaScript', 'Angular'],
      duration: '12 Weeks'
    },
    {
      icon: '📱',
      title: 'Digital Marketing',
      description: 'Learn how businesses grow through digital marketing.',
      level: 'Beginner → Advanced',
      skills: ['Social Media', 'Ads', 'Content', 'Analytics'],
      duration: '8 Weeks'
    },
    {
      icon: '🤖',
      title: 'AI Tools',
      description: 'Learn practical AI tools for work, business and productivity.',
      level: 'Beginner → Advanced',
      skills: ['AI Basics', 'Prompting', 'AI Tools', 'Automation'],
      duration: '6 Weeks'
    },
    {
      icon: '💼',
      title: 'Freelancing',
      description: 'Learn how to turn your skills into an online income.',
      level: 'Beginner → Advanced',
      skills: ['Portfolio', 'Clients', 'Proposals', 'Payments'],
      duration: '6 Weeks'
    }
  ];

}