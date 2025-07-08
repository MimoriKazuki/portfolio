-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for project status
CREATE TYPE project_status AS ENUM ('completed', 'in-progress', 'planned');

-- Create enum for project category
CREATE TYPE project_category AS ENUM ('homepage', 'landing-page', 'web-app', 'mobile-app');

-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar TEXT NOT NULL,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  location TEXT
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status project_status DEFAULT 'planned',
  category project_category DEFAULT 'web-app',
  duration TEXT,
  "order" INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_order ON projects("order");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Everyone can read projects
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Only authenticated users can modify data (for admin)
CREATE POLICY "Authenticated users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update profiles" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete profiles" ON profiles
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');