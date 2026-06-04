export interface Creator {
  id: string;
  name: string;
  avatar: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  cardCount: number;
  completionCount: string;
  progress?: number;
  timeRemaining?: string;
  creator: Creator;
  saved?: boolean;
}

export interface CardContent {
  id: string;
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  imageSource?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  sources?: { title: string; url: string; favicon?: string }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ConnectedTopic {
  id: string;
  title: string;
  description: string;
  relationship: string;
}

export interface LearningFlow {
  topicId: string;
  cards: CardContent[];
  quiz: { questions: QuizQuestion[] };
  connectedTopics: ConnectedTopic[];
  category?: string;
  difficultyScore?: number;
}
