const MyLibrary = [];

class Book {
  constructor(
    title = 'Unknown',
    author = 'Unknown',
    year = 'Unknown',
    pages = 0,
    completed = false,
    id = null
  ) {
    this.id = id ?? crypto.randomUUID(); // generate unique ID if not provided
    this.title = title;
    this.author = author;
    this.year = year;
    this.pages = pages;
    this.completed = Boolean(completed);
  }
}

function addBookToLibrary() {
  const bookData = getBookData();
  if (!bookData) {
    return;
  }

  const bookInstance = new Book(
    bookData.title,
    bookData.author,
    bookData.year,
    bookData.pages,
    bookData.completed
  );

  MyLibrary.push(bookInstance);
  console.log('Book added:', bookInstance);
}

function getBookData() {
  const titleInput = document.getElementById('title');
  const authorInput = document.getElementById('author');
  const yearInput = document.getElementById('year');
  const pagesInput = document.getElementById('pages');
  const completedInput = document.getElementById('completed');

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = parseInt(yearInput.value.trim(), 10);
  const pages = parseInt(pagesInput.value.trim(), 10);
  const completed = completedInput.checked;

  if (!title || !author || isNaN(year) || isNaN(pages)) {
    console.error('All fields are required and must be valid.');
    return null;
  }

  return { title, author, year, pages, completed };
}
