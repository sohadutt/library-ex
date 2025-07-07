const MyLibrary = [];

function book(title, author, year, pages, id) {
    this.title = title;
    this.author = author;
    this.year = year;
    this.pages = pages;
    this.id = id;
    this.read = false;
    this.toggleRead = function() {
        this.read = !this.read;
    }
}

function addBookToLibrary(title, author, year, pages) {
    const id = crypto.randomUUID();
    const bookInstance = new book(title, author, year, pages, id);
    MyLibrary.push(bookInstance);
}