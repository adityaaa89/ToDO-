export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  subTasks: SubTask[];
  createdAt: number;
}
