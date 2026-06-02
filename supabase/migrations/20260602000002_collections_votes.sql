CREATE TABLE saved_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  saved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE topic_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  vote SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_saved_topics_topic ON saved_topics(topic_id);
CREATE INDEX idx_topic_votes_topic ON topic_votes(topic_id);
CREATE INDEX idx_topic_votes_user ON topic_votes(user_id, topic_id);

ALTER TABLE saved_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read saved topics" ON saved_topics
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own saved topics" ON saved_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved topics" ON saved_topics
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read topic votes" ON topic_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can upsert own votes" ON topic_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON topic_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON topic_votes
  FOR DELETE USING (auth.uid() = user_id);
