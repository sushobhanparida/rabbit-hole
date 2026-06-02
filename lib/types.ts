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

export interface TimelineEvent {
  date: string;
  label: string;
  description?: string;
}

export interface CardContent {
  id: string;
  type: "hook" | "fact" | "timeline" | "diagram" | "comparison" | "prediction" | "poll" | "question";
  title: string;
  body: string;
  image?: string;
  imageAlt?: string;
  imageSource?: string;
  visualDescription?: string;
  fact?: string;
  source?: string;
  events?: TimelineEvent[];
  diagramLabels?: string[];
  comparisonA?: string;
  comparisonB?: string;
  labelA?: string;
  labelB?: string;
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
}
