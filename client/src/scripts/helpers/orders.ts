export type Order = {
  id: number; // Assigned by the server
  name: string;
  description: string;
  recipient: number; // Assigned by the server
  deadline: string;
  placed: string;
  taken: boolean;
  completed: boolean;
};