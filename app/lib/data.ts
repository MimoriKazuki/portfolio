import { Project, Skill, Profile } from '@/app/types'

export const profile: Profile = {
  name: 'Your Name',
  title: 'Full Stack Developer',
  bio: 'Passionate about creating beautiful web experiences and building innovative solutions. Check out my projects below.',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  social: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
  },
  location: 'Tokyo, Japan',
  email: 'contact@example.com'
}


export const projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce platform built with Next.js, Stripe, and PostgreSQL',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    github: 'https://github.com',
    demo: 'https://example.com',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    featured: true,
    status: 'completed'
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
    github: 'https://github.com',
    demo: 'https://example.com',
    technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    featured: false,
    status: 'completed'
  },
  {
    id: '3',
    title: 'AI-Powered Code Assistant',
    description: 'VS Code extension that provides AI-powered code suggestions and explanations',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    github: 'https://github.com',
    technologies: ['TypeScript', 'VS Code API', 'OpenAI'],
    status: 'in-progress'
  },
]

export const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'frontend', level: 5 },
  { name: 'Next.js', category: 'frontend', level: 5 },
  { name: 'TypeScript', category: 'frontend', level: 4 },
  { name: 'Tailwind CSS', category: 'frontend', level: 5 },
  { name: 'Vue.js', category: 'frontend', level: 3 },
  
  // Backend
  { name: 'Node.js', category: 'backend', level: 4 },
  { name: 'Python', category: 'backend', level: 4 },
  { name: 'GraphQL', category: 'backend', level: 3 },
  { name: 'REST API', category: 'backend', level: 5 },
  
  // Database
  { name: 'PostgreSQL', category: 'database', level: 4 },
  { name: 'MongoDB', category: 'database', level: 4 },
  { name: 'Redis', category: 'database', level: 3 },
  
  // DevOps
  { name: 'Docker', category: 'devops', level: 4 },
  { name: 'AWS', category: 'devops', level: 3 },
  { name: 'CI/CD', category: 'devops', level: 4 },
  
  // Other
  { name: 'Git', category: 'other', level: 5 },
  { name: 'Agile', category: 'other', level: 4 },
  { name: 'UI/UX Design', category: 'other', level: 3 },
]