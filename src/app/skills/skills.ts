import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  imports: [],
  templateUrl: './skills.html',
  styleUrl: './skills.css'
})
export class Skills {

  skills = [
    {
      icon: '🎨',
      name: 'Canva',
      description: 'Learn graphic design and create professional designs.'
    },
    {
      icon: '🎬',
      name: 'Video Editing',
      description: 'Create professional videos for YouTube and social media.'
    },
    {
      icon: '💻',
      name: 'Web Development',
      description: 'Learn how to build modern websites and applications.'
    },
    {
      icon: '📱',
      name: 'Digital Marketing',
      description: 'Learn how businesses attract customers online.'
    },
    {
      icon: '🤖',
      name: 'AI Tools',
      description: 'Learn practical AI tools and improve your productivity.'
    },
    {
      icon: '🔍',
      name: 'SEO',
      description: 'Learn how to make websites more visible on search engines.'
    }
  ];

}