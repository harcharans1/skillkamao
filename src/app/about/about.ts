import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {

  stats = [
    {
      number: '10K+',
      label: 'Learners'
    },
    {
      number: '50+',
      label: 'Skill Courses'
    },
    {
      number: '25+',
      label: 'Learning Roadmaps'
    },
    {
      number: '4.9/5',
      label: 'Learner Rating'
    }
  ];

  values = [
    {
      icon: '🎯',
      title: 'Practical Learning',
      description:
        'Learn useful skills through practical lessons, exercises and real-world projects.'
    },
    {
      icon: '🚀',
      title: 'Build & Practice',
      description:
        'Turn what you learn into projects that help you gain confidence and experience.'
    },
    {
      icon: '💰',
      title: 'Skills That Create Opportunities',
      description:
        'Develop skills that can help you explore freelance work, careers and new opportunities.'
    },
    {
      icon: '🌱',
      title: 'Keep Growing',
      description:
        'Follow structured roadmaps and continue improving one skill at a time.'
    }
  ];

}