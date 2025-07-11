let MyLibrary = [];
let editingBookId = null;
let currentEditBookId = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalOverlay        = document.getElementById('modal-overlay');
  const bookForm            = document.getElementById('book-form');
  const closeModalBtn       = document.getElementById('close-modal');
  const addBookBtn          = document.getElementById('add-book');
  const editBookBtn         = document.getElementById('edit-book');
  const editModalOverlay    = document.getElementById('edit-modal-overlay');
  const closeEditModalBtn   = document.getElementById('close-edit-modal');
  const toggleReadStatusBtn = document.getElementById('toggle-read-status');
  const deleteBookBtn       = document.getElementById('delete-book');
  const editBookInfo        = document.getElementById('edit-book-info');
  const bookListUnread      = document.getElementById('book-list-unread');
  const bookListRead        = document.getElementById('book-list-read');

  class Book {
    constructor(title, author, year, pages, rating, completed) {
      this.id        = crypto.randomUUID();
      this.title     = title;
      this.author    = author;
      this.year      = year;
      this.pages     = pages;
      this.rating    = rating;
      this.completed = Boolean(completed);
    }
  }

  function addBookToLibrary(data) {
    const book = new Book(
      data.title, data.author, data.year,
      data.pages, data.rating, data.completed
    );
    MyLibrary.push(book);
  }

  function updateBookInLibrary(id, data) {
    const idx = MyLibrary.findIndex(b => b.id === id);
    if (idx > -1) {
      MyLibrary[idx] = { ...MyLibrary[idx], ...data };
    }
  }

  function renderLibrary() {
    const unreadSection = document.querySelector('.unread');
    const readSection   = document.querySelector('.read');

    bookListUnread.innerHTML = '';
    bookListRead.innerHTML = '';

    let hasUnread = false;
    let hasRead = false;

    for (const book of MyLibrary) {
      const bookElem = createBookElement(book);
      if (book.completed) {
        bookListRead.appendChild(bookElem);
        hasRead = true;
      } else {
        bookListUnread.appendChild(bookElem);
        hasUnread = true;
      }
    }

    unreadSection.style.display = hasUnread ? 'block' : 'none';
    readSection.style.display   = hasRead   ? 'block' : 'none';
  }

  function createBookElement(book) {
    const div = document.createElement('div');
    div.className = 'book';
    div.dataset.id = book.id;
    div.innerHTML = `
      <div class="list-r">
        <div class="rating">${book.rating.toFixed(1)}</div>
        <div class="book-details">
          <span class="book-title">${book.title}</span>
          <span class="book-author">${book.author}</span>
        </div>
      </div>
      <input type="checkbox" class="book-checkbox" />
    `;

    toggleReadStatusBtn.addEventListener('change', e => {
      if (e.target.checked) {
        book.completed = true;
      } else {
        book.completed = !book.completed;
      }
      renderLibrary();
    });

    return div;
  }

  function getBookDataFromForm() {
    const title     = bookForm.title.value.trim();
    const author    = bookForm.author.value.trim();
    const year      = parseInt(bookForm.year.value, 10);
    const pages     = parseInt(bookForm.pages.value, 10);
    const rating    = parseFloat(bookForm.rating.value);
    const completed = bookForm.completed;

    if (!title || !author || isNaN(year) || isNaN(pages) || isNaN(rating)) {
      alert('Please fill in all fields correctly.');
      return null;
    }
    return { title, author, year, pages, rating, completed };
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const data = getBookDataFromForm();
    if (!data) return;

    if (editingBookId) updateBookInLibrary(editingBookId, data);
    else               addBookToLibrary(data);

    renderLibrary();
    closeModal();
  }

  function openModal(book = null) {
    modalOverlay.classList.add('show');
    document.addEventListener('keydown', handleEscape);

    if (book) {
      bookForm.title.value   = book.title;
      bookForm.author.value  = book.author;
      bookForm.year.value    = book.year;
      bookForm.pages.value   = book.pages;
      bookForm.rating.value  = book.rating;
      bookForm.completed     = book.completed;
      editingBookId = book.id;
    } else {
      bookForm.reset();
      editingBookId = null;
    }
  }

  function closeModal() {
    modalOverlay.classList.remove('show');
    document.removeEventListener('keydown', handleEscape);
    bookForm.reset();
    editingBookId = null;
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closeModal();
  }

  function openEditModal(book) {
    currentEditBookId = book.id;
    editBookInfo.textContent = `"${book.title}" by ${book.author} (${book.year}) — ${book.pages} pages. Status: ${book.completed ? 'Read' : 'Unread'}`;
    editModalOverlay.classList.add('show');
    editModalOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeEditModal() {
    editModalOverlay.classList.remove('show');
    editModalOverlay.setAttribute('aria-hidden', 'true');
    currentEditBookId = null;
  }

  function toggleReadStatus() {
    if (!currentEditBookId) return;
    const book = MyLibrary.find(b => b.id === currentEditBookId);
    if (book) {
      book.completed = !book.completed;
      closeEditModal();
      renderLibrary();
    }
  }

  function deleteBook() {
    if (!currentEditBookId) return;
    const index = MyLibrary.findIndex(b => b.id === currentEditBookId);
    if (index > -1) {
      MyLibrary.splice(index, 1);
    }
    closeEditModal();
    renderLibrary();
  }

  closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  bookForm.addEventListener('submit', handleFormSubmit);
  addBookBtn.addEventListener('click', () => openModal());

  editBookBtn.addEventListener('click', () => {
    const selectedBooks = Array.from(document.querySelectorAll('.book-checkbox:checked'));
    if (selectedBooks.length === 0) {
      alert('Please select a book to edit.');
      return;
    }
  
    const bookDiv = selectedBooks[0].closest('.book');
    for (const book of selectedBooks) {
      if (book.checked) {
        editingBookId = bookDiv.dataset.id;
        break;
      }
    }
    const book = MyLibrary.find(b => b.id === editingBookId);
    if (book) {
      openEditModal(book);
    }
  });

  closeEditModalBtn.addEventListener('click', closeEditModal);
  toggleReadStatusBtn.addEventListener('click', toggleReadStatus);
  deleteBookBtn.addEventListener('click', deleteBook);

  editModalOverlay.addEventListener('click', e => {
    if (e.target === editModalOverlay) closeEditModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editModalOverlay.classList.contains('show')) {
      closeEditModal();
    }
  });

  renderLibrary();
});

// Make book objects available globally for testing
function getLibrary() {
  return fetch('./assist/books.json')
    .then(response => response.json())
    .then(data => {
      MyLibrary = data;
      renderLibrary();
    });
}