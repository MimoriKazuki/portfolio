import { Project } from '@/app/types'

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Corporate Landing Page',
    description: 'Modern corporate landing page with smooth animations and responsive design',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    demo: 'https://example.com',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    featured: true,
    status: 'completed',
    category: 'landing-page',
    duration: '2週間'
  },
  {
    id: '2',
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce platform built with Next.js, Stripe, and PostgreSQL',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    demo: 'https://example.com',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    featured: true,
    status: 'completed',
    category: 'web-app',
    duration: '6週間'
  },
  {
    id: '3',
    title: 'Task Management Mobile App',
    description: 'Cross-platform mobile app for task management with real-time sync',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop',
    demo: 'https://example.com',
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Expo'],
    featured: true,
    status: 'completed',
    category: 'mobile-app',
    duration: '4週間'
  },
  {
    id: '4',
    title: 'Corporate Homepage',
    description: 'Professional corporate homepage with modern design and interactive elements',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    demo: 'https://example.com',
    technologies: ['React', 'Three.js', 'GSAP', 'Tailwind CSS'],
    featured: false,
    status: 'completed',
    category: 'homepage',
    duration: '3週間'
  },
  {
    id: '5',
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard for SaaS applications with real-time data',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    demo: 'https://example.com',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Chart.js'],
    featured: false,
    status: 'in-progress',
    category: 'web-app',
    duration: '5週間'
  },
]

export const mockProfile = {
  name: 'Your Name',
  title: 'Full Stack Developer',
  bio: 'Passionate about creating beautiful web experiences and building innovative solutions. Check out my projects below.',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  github_url: 'https://github.com',
  twitter_url: 'https://twitter.com',
}