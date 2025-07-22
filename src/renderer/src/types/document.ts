export interface Document {
  id: number | string;
  name: string;
  type: "pdf" | "p12";
  status: string;
  createdAt?: Date;
}