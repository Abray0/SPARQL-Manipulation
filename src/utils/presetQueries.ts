const PREFIX = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://example.org/books/>
`;

export const presetQueries = [
  {
    id: 'all-books',
    name: 'All Books',
    description: 'List all books in the database',
    category: 'General',
    query: `${PREFIX}
SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
}
ORDER BY ?title`
  },
  {
    id: 'sci-fi-books',
    name: 'Science Fiction Books',
    description: 'Find all science fiction books',
    category: 'Genre',
    query: `${PREFIX}
SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
        FILTER (?genre = "Science Fiction")
}
`
  },
  {
    id: 'classic-books',
    name: 'Classic Books',
    description: 'Books published before 1950',
    category: 'Time Period',
    query: `${PREFIX}
SELECT ?title ?author ?publishedYear ?genre ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :publishedYear ?publishedYear ;
        :genre ?genre ;
        :coverImage ?coverImage .
  FILTER (?publishedYear < 1950)
}
`
  },
  {
    id: 'romance-books',
    name: 'Romance Books',
    description: 'Find all romance books',
    category: 'Genre',
    query: `${PREFIX}
SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
        FILTER (?genre = "Romance")
}
`
  },
  {
    id: 'books-after-2000',
    name: 'Books Published After 2000',
    description: 'List all books published after the year 2000',
    category: 'Time Period',
    query: `${PREFIX}
SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
  FILTER (?publishedYear > 2000)
}
`
  },
  {
    id: 'books-by-author',
    name: 'Books by George Orwell',
    description: 'Find all books by George Orwell',
    category: 'Author',
    query: `${PREFIX}
SELECT ?title ?author ?genre ?publishedYear ?coverImage
WHERE {
  ?book a :Book ;
        :title ?title ;
        :author ?author ;
        :genre ?genre ;
        :publishedYear ?publishedYear ;
        :coverImage ?coverImage .
        FILTER (?author = "George Orwell")
}
`
  }
];
