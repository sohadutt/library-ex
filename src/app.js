const MyLibrary = [];

class Book {
  constructor(
    title = 'Unknown',
    author = 'Unknown',
    pages = 0,
    completed = false
  ) {
    this.id = ++uniqueId;
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.completed = completed;
    this.container = null;
  }
}

function addBookToLibrary(title, author, year, pages) {
    const id = crypto.randomUUID();
    const bookInstance = new Book(title, author, year, pages, id);
    MyLibrary.push(bookInstance);
}