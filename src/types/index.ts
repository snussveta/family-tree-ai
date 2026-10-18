export interface PersonData {
  id: string;
  name: string;
  birthDate?: string | null;
  relation: string;
  hobbies: string[];
  preferences: string[];
  notes?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipData {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  createdAt: string;
}

export interface GraphData {
  nodes: (PersonData & {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    isCenter?: boolean;
    val?: number;
  })[];
  links: {
    id: string;
    source: string | PersonData;
    target: string | PersonData;
    label: string;
  }[];
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: {
    name: string;
    args: any;
    result: string;
  }[] | null;
  createdAt: string;
}
