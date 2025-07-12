-- Database setup for SkillSwap platform
-- Run this in your Supabase SQL editor

-- Enable Row Level Security (RLS)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  location TEXT,
  profile_photo TEXT,
  skills_offered TEXT[] DEFAULT '{}',
  skills_wanted TEXT[] DEFAULT '{}',
  availability TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_swaps INTEGER DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create swap_requests table
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_offered TEXT NOT NULL,
  skill_wanted TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swap_request_id UUID REFERENCES swap_requests(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_messages table
CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_public ON users(is_public);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_swap_requests_from_user ON swap_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_to_user ON swap_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_to_user ON feedback(to_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_is_active ON admin_messages(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for swap_requests table
CREATE POLICY "Users can view swap requests they're involved in" ON swap_requests
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can create swap requests" ON swap_requests
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Users can update swap requests they're involved in" ON swap_requests
    FOR UPDATE USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

-- Create RLS policies for feedback table
CREATE POLICY "Users can view feedback they're involved in" ON feedback
    FOR SELECT USING (
        auth.uid()::text = from_user_id::text OR 
        auth.uid()::text = to_user_id::text
    );

CREATE POLICY "Users can create feedback" ON feedback
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

-- Create RLS policies for admin_messages table (admin only)
CREATE POLICY "Admins can manage admin messages" ON admin_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Create a function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    pending_swaps BIGINT,
    completed_swaps BIGINT,
    average_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE role = 'user') as total_users,
        COUNT(*) FILTER (WHERE role = 'user' AND is_active = true) as active_users,
        (SELECT COUNT(*) FROM swap_requests WHERE status = 'pending') as pending_swaps,
        (SELECT COUNT(*) FROM swap_requests WHERE status = 'completed') as completed_swaps,
        COALESCE(AVG(f.rating), 5.0) as average_rating
    FROM users u
    LEFT JOIN feedback f ON u.id = f.to_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
INSERT INTO users (id, name, email, location, skills_offered, skills_wanted, availability, role, rating, total_swaps) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@example.com', 'New York, NY', ARRAY['JavaScript', 'React', 'Node.js'], ARRAY['Python', 'Data Science'], ARRAY['Weekdays', 'Evenings'], 'user', 4.8, 12),
('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 'bob@example.com', 'San Francisco, CA', ARRAY['Python', 'Machine Learning'], ARRAY['JavaScript', 'Web Development'], ARRAY['Weekends', 'Afternoons'], 'user', 4.5, 8),
('550e8400-e29b-41d4-a716-446655440003', 'Carol Davis', 'carol@example.com', 'Chicago, IL', ARRAY['Graphic Design', 'Photoshop'], ARRAY['Photography', 'Video Editing'], ARRAY['Mornings', 'Weekdays'], 'user', 4.9, 15),
('550e8400-e29b-41d4-a716-446655440004', 'David Wilson', 'david@example.com', 'Austin, TX', ARRAY['Guitar', 'Music Production'], ARRAY['Piano', 'Singing'], ARRAY['Evenings', 'Weekends'], 'user', 4.2, 6),
('550e8400-e29b-41d4-a716-446655440005', 'Emma Brown', 'emma@example.com', 'Seattle, WA', ARRAY['Cooking', 'Baking'], ARRAY['Gardening', 'Yoga'], ARRAY['Mornings', 'Weekdays'], 'user', 4.7, 10);

-- Insert sample swap requests
INSERT INTO swap_requests (from_user_id, to_user_id, skill_offered, skill_wanted, message, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'JavaScript', 'Python', 'I can help you learn JavaScript and React!', 'completed'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Python', 'Graphic Design', 'Looking to learn some design skills', 'pending'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Graphic Design', 'Guitar', 'Would love to learn guitar!', 'accepted'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Music Production', 'Cooking', 'Interested in learning to cook', 'pending');

-- Insert sample feedback
INSERT INTO feedback (from_user_id, to_user_id, swap_request_id, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 5, 'Great teacher! Learned a lot about JavaScript.'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 4, 'Excellent Python tutor, very patient.');

-- Insert sample admin messages
INSERT INTO admin_messages (title, content, type, is_active) VALUES
('Welcome to SkillSwap!', 'We''re excited to have you join our community. Start by browsing skills and connecting with others!', 'info', true),
('Platform Maintenance', 'We''ll be performing maintenance on Sunday at 2 AM EST. Service may be briefly interrupted.', 'maintenance', true),
('New Features Coming', 'Stay tuned for new features including video calls and skill verification!', 'info', true); 