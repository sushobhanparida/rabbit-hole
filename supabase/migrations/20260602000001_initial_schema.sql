CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  bio TEXT,
  total_xp INTEGER DEFAULT 0,
  topics_completed INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE learning_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  cards JSONB NOT NULL,
  quiz JSONB NOT NULL,
  connected_topics JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'template',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_learning_flows_topic ON learning_flows(topic_id);

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  cards_viewed INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 0,
  quiz_score INTEGER DEFAULT 0,
  quiz_total INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  xp_breakdown JSONB,
  quiz_xp_values JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE recent_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recent_topics_user ON recent_topics(user_id, viewed_at DESC);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can read own progress" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can read own recent topics" ON recent_topics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recent topics" ON recent_topics
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recent topics" ON recent_topics
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can read learning flows" ON learning_flows
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage learning flows" ON learning_flows
  FOR ALL USING (auth.role() = 'service_role');
