import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {

  contactCards = [
    {
      icon: '📧',
      title: 'Email Us',
      value: 'hello@skillkamao.com',
      description: 'We usually reply within 24 hours.'
    },
    {
      icon: '💬',
      title: 'Community',
      value: 'Join our community',
      description: 'Connect with other learners and creators.'
    },
    {
      icon: '📍',
      title: 'Our Location',
      value: 'India',
      description: 'Building skills and opportunities from India.'
    }
  ];

  faqs = [
    {
      question: 'How can I start learning?',
      answer:
        'Choose a course or roadmap, create your account and start learning at your own pace.'
    },
    {
      question: 'Are the courses beginner friendly?',
      answer:
        'Yes. Many SkillKamao learning paths are designed to take you from beginner level to practical projects.'
    },
    {
      question: 'Can I learn on mobile?',
      answer:
        'Yes. SkillKamao is designed to provide a responsive learning experience across desktop, tablet and mobile.'
    },
    {
      question: 'How can I contact SkillKamao?',
      answer:
        'You can use the contact form on this page or reach us through the available contact channels.'
    }
  ];

}