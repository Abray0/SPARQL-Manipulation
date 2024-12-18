export interface Book {
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  isbn: string;
  coverImage: string;
}

export interface QueryResult {
  subject: string;
  predicate: string;
  object: string;
}

export interface PresetQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  category: string;
}