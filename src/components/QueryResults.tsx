import { BookCard } from './BookCard';
import { Book } from '../types/Book';

interface QueryResultsProps {
  results: Book[];
}

export function QueryResults({ results }: QueryResultsProps) {
  if (!results.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results to display. Try running a query!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((book) => (
        <BookCard key={book.isbn} book={book} />
      ))}
    </div>
  );
}
