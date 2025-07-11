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
    const completed = bookForm.completed.checked;

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

  const libdata = [[
  {
    "id": "a53eaec8-09ff-4e30-a724-7268345fbebe",
    "title": "Shadows of Eternity 8",
    "author": "Maya Rao",
    "year": 1966,
    "pages": 1162,
    "rating": 2.5,
    "completed": true
  },
  {
    "id": "336886f2-140c-491f-8edf-d2beb8770b52",
    "title": "Whispers in the Wind 8",
    "author": "Noah Patel",
    "year": 2023,
    "pages": 907,
    "rating": 2.4,
    "completed": true
  },
  {
    "id": "bf1c8d91-bf32-48dd-98a3-7bd6ec215919",
    "title": "The Last Voyage 14",
    "author": "Yuki Nakamura",
    "year": 1964,
    "pages": 836,
    "rating": 1.7,
    "completed": true
  },
  {
    "id": "6fbf9949-ef2a-4b54-925d-073a18fc96c6",
    "title": "Beyond the Stars 3",
    "author": "Maya Rao",
    "year": 2011,
    "pages": 1114,
    "rating": 3.7,
    "completed": true
  },
  {
    "id": "2b216a7a-4356-418f-bee7-4af7a047496e",
    "title": "Shadows of Eternity 15",
    "author": "Yuki Nakamura",
    "year": 1957,
    "pages": 228,
    "rating": 4.1,
    "completed": true
  },
  {
    "id": "836ca512-d554-481f-8f67-6938c370b300",
    "title": "The Forgotten Kingdom 11",
    "author": "Emily Zhang",
    "year": 1950,
    "pages": 686,
    "rating": 4.1,
    "completed": false
  },
  {
    "id": "2ba86e2a-59e4-4403-8c12-879487965190",
    "title": "Echoes of the Past 6",
    "author": "Emily Zhang",
    "year": 1984,
    "pages": 258,
    "rating": 4.2,
    "completed": true
  },
  {
    "id": "25fb3262-ee5b-4385-a183-c37dfd18660b",
    "title": "Infinite Skies 17",
    "author": "L. J. Fernandez",
    "year": 1967,
    "pages": 412,
    "rating": 1.4,
    "completed": false
  },
  {
    "id": "e6ab14df-cc9f-45df-bf1b-780266513cff",
    "title": "The Last Voyage 6",
    "author": "Zara Ahmed",
    "year": 1953,
    "pages": 315,
    "rating": 1.3,
    "completed": true
  },
  {
    "id": "40c5f10c-4243-4229-80df-3afb67c2ce11",
    "title": "The Lost Empire 2",
    "author": "Maya Rao",
    "year": 1953,
    "pages": 833,
    "rating": 1.8,
    "completed": false
  },
  {
    "id": "bb377a65-3d1e-4dc0-8999-2a7b349784be",
    "title": "Infinite Skies 3",
    "author": "Maya Rao",
    "year": 2008,
    "pages": 608,
    "rating": 4.5,
    "completed": true
  },
  {
    "id": "3435bf1e-9c1f-4734-bdfd-f38e715d9523",
    "title": "Shadows of Eternity 7",
    "author": "David Kim",
    "year": 1986,
    "pages": 113,
    "rating": 2.1,
    "completed": false
  },
  {
    "id": "f0a6a670-1bbb-447e-b1fa-e04696dad6cb",
    "title": "Memory Lane 18",
    "author": "Maya Rao",
    "year": 1958,
    "pages": 811,
    "rating": 1.7,
    "completed": false
  },
  {
    "id": "74f6810f-7c9a-4f91-9d74-22257effd78e",
    "title": "The Forgotten Kingdom 15",
    "author": "David Kim",
    "year": 2002,
    "pages": 465,
    "rating": 4.9,
    "completed": true
  },
  {
    "id": "c832e3cd-1045-4d75-9f79-e88405c2ae64",
    "title": "Beyond the Stars 2",
    "author": "L. J. Fernandez",
    "year": 1993,
    "pages": 552,
    "rating": 4.5,
    "completed": false
  },
  {
    "id": "5c0de626-8bb6-4390-aee6-8ffe0e7e1506",
    "title": "The Lost Empire 17",
    "author": "Maya Rao",
    "year": 1966,
    "pages": 1046,
    "rating": 1.2,
    "completed": true
  },
  {
    "id": "11b4af1b-e83f-47d1-b6fd-66fe64ec4e27",
    "title": "Whispers in the Wind 4",
    "author": "A. K. Sharma",
    "year": 1987,
    "pages": 1067,
    "rating": 4.3,
    "completed": true
  },
  {
    "id": "04242976-b482-4fa6-b4b1-964dca51bd46",
    "title": "Echoes of the Past 20",
    "author": "Emily Zhang",
    "year": 1972,
    "pages": 491,
    "rating": 3.4,
    "completed": false
  },
  {
    "id": "06328cac-896e-4c59-97dc-4c489a4ee55a",
    "title": "Code of Silence 19",
    "author": "Zara Ahmed",
    "year": 1992,
    "pages": 836,
    "rating": 1.9,
    "completed": false
  },
  {
    "id": "316dc991-e869-41e7-b509-9ef3bc3fe80e",
    "title": "Beyond the Stars 12",
    "author": "Noah Patel",
    "year": 1987,
    "pages": 1095,
    "rating": 3.5,
    "completed": true
  },
  {
    "id": "d8c0182e-98a4-4073-a15e-5e0101cebc3f",
    "title": "Shadows of Eternity 2",
    "author": "Noah Patel",
    "year": 1966,
    "pages": 1038,
    "rating": 1.5,
    "completed": true
  },
  {
    "id": "149abb89-6bb8-4a0f-a5c8-1bdb50217b3e",
    "title": "Shadows of Eternity 5",
    "author": "Carlos Mendes",
    "year": 1966,
    "pages": 630,
    "rating": 2.6,
    "completed": true
  },
  {
    "id": "b2dd88b6-4046-4e7d-a3eb-aa46f65d5cb9",
    "title": "The Forgotten Kingdom 15",
    "author": "Yuki Nakamura",
    "year": 1967,
    "pages": 684,
    "rating": 1.1,
    "completed": false
  },
  {
    "id": "7913e44c-d937-4ac4-8b52-333112d3f2ad",
    "title": "Whispers in the Wind 4",
    "author": "Maya Rao",
    "year": 1964,
    "pages": 903,
    "rating": 1.2,
    "completed": false
  },
  {
    "id": "226819f2-df07-4d4f-98fa-985464f9e5d3",
    "title": "The Lost Empire 17",
    "author": "L. J. Fernandez",
    "year": 1969,
    "pages": 365,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "b300579f-db8d-40dd-8edb-76e92081224e",
    "title": "Shadows of Eternity 20",
    "author": "Sarah Thompson",
    "year": 2004,
    "pages": 275,
    "rating": 4.3,
    "completed": true
  },
  {
    "id": "e428ea8d-ad25-456b-bc70-aceb6591bac6",
    "title": "Memory Lane 5",
    "author": "L. J. Fernandez",
    "year": 1957,
    "pages": 778,
    "rating": 3.5,
    "completed": false
  },
  {
    "id": "3b0c9892-a3c8-4580-a7bf-06a0776ad644",
    "title": "The Lost Empire 14",
    "author": "Maya Rao",
    "year": 2009,
    "pages": 609,
    "rating": 4.5,
    "completed": true
  },
  {
    "id": "ea9bc754-2684-4d39-8483-256b8f7497ac",
    "title": "The Lost Empire 6",
    "author": "L. J. Fernandez",
    "year": 1964,
    "pages": 432,
    "rating": 2.4,
    "completed": true
  },
  {
    "id": "75a8026a-4c0e-4fd1-80a5-03647bcd0711",
    "title": "Whispers in the Wind 9",
    "author": "A. K. Sharma",
    "year": 1980,
    "pages": 818,
    "rating": 1.1,
    "completed": true
  },
  {
    "id": "78112cfa-5fd4-4f5d-ad5c-36bca5fba28b",
    "title": "The Forgotten Kingdom 1",
    "author": "Yuki Nakamura",
    "year": 1957,
    "pages": 128,
    "rating": 3.2,
    "completed": true
  },
  {
    "id": "908dce81-279f-49b9-aa62-2ce6c9ef9281",
    "title": "Beyond the Stars 8",
    "author": "Emily Zhang",
    "year": 2011,
    "pages": 504,
    "rating": 2.9,
    "completed": false
  },
  {
    "id": "bd9fff98-6644-42c3-b812-05a918576937",
    "title": "Memory Lane 1",
    "author": "L. J. Fernandez",
    "year": 1956,
    "pages": 1136,
    "rating": 3.4,
    "completed": true
  },
  {
    "id": "3b9267c4-7123-46ab-98e5-f868d39b70c6",
    "title": "Infinite Skies 4",
    "author": "Carlos Mendes",
    "year": 2002,
    "pages": 1156,
    "rating": 2.0,
    "completed": true
  },
  {
    "id": "526c6dcd-28b2-45e2-82e0-9257481382f5",
    "title": "Shadows of Eternity 7",
    "author": "Emily Zhang",
    "year": 1996,
    "pages": 196,
    "rating": 1.4,
    "completed": false
  },
  {
    "id": "9810a29b-c3b7-44be-9ce7-794143d22077",
    "title": "Whispers in the Wind 15",
    "author": "Emily Zhang",
    "year": 1990,
    "pages": 376,
    "rating": 2.5,
    "completed": false
  },
  {
    "id": "a7032f18-73d4-4c73-9499-1a8e3a04af87",
    "title": "The Forgotten Kingdom 17",
    "author": "Yuki Nakamura",
    "year": 2016,
    "pages": 205,
    "rating": 1.5,
    "completed": true
  },
  {
    "id": "f0c65d57-524f-422b-99dc-1aadf727abe0",
    "title": "Echoes of the Past 2",
    "author": "David Kim",
    "year": 1982,
    "pages": 1119,
    "rating": 1.5,
    "completed": true
  },
  {
    "id": "63f29842-5995-4dcd-bba5-dfe3f7c67117",
    "title": "Beyond the Stars 5",
    "author": "Carlos Mendes",
    "year": 1971,
    "pages": 1056,
    "rating": 3.5,
    "completed": false
  },
  {
    "id": "4f7c890d-6175-4ea7-b136-9d8a925712f6",
    "title": "Shadows of Eternity 15",
    "author": "L. J. Fernandez",
    "year": 1988,
    "pages": 1073,
    "rating": 4.2,
    "completed": false
  },
  {
    "id": "2ab03eae-067a-41af-a155-63c4e0653e80",
    "title": "Echoes of the Past 1",
    "author": "Noah Patel",
    "year": 2025,
    "pages": 264,
    "rating": 3.2,
    "completed": false
  },
  {
    "id": "6ae99d87-2951-4936-baa4-ec6ac6905738",
    "title": "Shadows of Eternity 4",
    "author": "Emily Zhang",
    "year": 1983,
    "pages": 1034,
    "rating": 4.3,
    "completed": false
  },
  {
    "id": "b8c69850-2360-4356-9d38-393fa1a8d18d",
    "title": "Memory Lane 14",
    "author": "Sarah Thompson",
    "year": 1973,
    "pages": 219,
    "rating": 1.5,
    "completed": false
  },
  {
    "id": "82283aac-cb67-4a14-8b20-426fe7b17522",
    "title": "Code of Silence 19",
    "author": "Noah Patel",
    "year": 1956,
    "pages": 612,
    "rating": 1.4,
    "completed": false
  },
  {
    "id": "7165bede-cc9a-452f-b22b-ca28af991c5a",
    "title": "Whispers in the Wind 7",
    "author": "Sarah Thompson",
    "year": 2025,
    "pages": 286,
    "rating": 2.1,
    "completed": false
  },
  {
    "id": "1386c4ec-8580-46e0-a39d-6bf45d868e74",
    "title": "Code of Silence 18",
    "author": "L. J. Fernandez",
    "year": 1971,
    "pages": 1007,
    "rating": 1.9,
    "completed": true
  },
  {
    "id": "f2d82639-f4f8-4e5c-a489-e122f7d23775",
    "title": "Beyond the Stars 17",
    "author": "Noah Patel",
    "year": 1990,
    "pages": 904,
    "rating": 3.7,
    "completed": true
  },
  {
    "id": "21d45e8e-a3bf-4ca4-9114-de2316a20eea",
    "title": "Whispers in the Wind 10",
    "author": "Emily Zhang",
    "year": 2022,
    "pages": 364,
    "rating": 2.7,
    "completed": true
  },
  {
    "id": "a33bf71d-3011-4910-8a2d-535e17e65c2d",
    "title": "The Last Voyage 12",
    "author": "L. J. Fernandez",
    "year": 2002,
    "pages": 928,
    "rating": 3.3,
    "completed": true
  },
  {
    "id": "f8542100-0e22-43f1-838e-a4386f2bf91d",
    "title": "Infinite Skies 14",
    "author": "Sarah Thompson",
    "year": 1986,
    "pages": 139,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "ba882ea1-1f04-4bc4-ae76-1b230804b06e",
    "title": "Code of Silence 2",
    "author": "David Kim",
    "year": 1974,
    "pages": 1124,
    "rating": 5.0,
    "completed": false
  },
  {
    "id": "750182c0-c057-43ff-8d7e-1affda622958",
    "title": "Code of Silence 17",
    "author": "Sarah Thompson",
    "year": 1995,
    "pages": 417,
    "rating": 3.1,
    "completed": true
  },
  {
    "id": "8fe26281-a042-4f9c-98cc-92d867512175",
    "title": "Echoes of the Past 17",
    "author": "Carlos Mendes",
    "year": 2014,
    "pages": 746,
    "rating": 2.3,
    "completed": true
  },
  {
    "id": "6fc23ffc-4780-43f7-bdf2-58fb94c2e591",
    "title": "Whispers in the Wind 11",
    "author": "Noah Patel",
    "year": 1969,
    "pages": 674,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "4080fcf4-2756-4431-8f97-2c4fb66bcffe",
    "title": "Whispers in the Wind 20",
    "author": "Sarah Thompson",
    "year": 1961,
    "pages": 793,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "8cb38bf6-826a-40e8-823c-04300465f022",
    "title": "The Forgotten Kingdom 17",
    "author": "Yuki Nakamura",
    "year": 1957,
    "pages": 835,
    "rating": 2.3,
    "completed": false
  },
  {
    "id": "18a894b9-9daa-45ec-af9a-d11bd3c5dd31",
    "title": "Infinite Skies 13",
    "author": "Noah Patel",
    "year": 1952,
    "pages": 589,
    "rating": 1.9,
    "completed": false
  },
  {
    "id": "0ad912b3-69ba-46dd-a681-dabb9d842812",
    "title": "Code of Silence 13",
    "author": "Sarah Thompson",
    "year": 1969,
    "pages": 418,
    "rating": 3.1,
    "completed": true
  },
  {
    "id": "38f71790-a43c-4b0e-953f-203991613a04",
    "title": "Shadows of Eternity 20",
    "author": "Emily Zhang",
    "year": 1976,
    "pages": 998,
    "rating": 2.1,
    "completed": false
  },
  {
    "id": "7cdd841a-83ea-499e-89c1-396685ca6b7c",
    "title": "Beyond the Stars 17",
    "author": "A. K. Sharma",
    "year": 1992,
    "pages": 406,
    "rating": 4.5,
    "completed": true
  },
  {
    "id": "9497090a-fe58-4b0b-a9b0-593eed2a8ba2",
    "title": "Beyond the Stars 19",
    "author": "Noah Patel",
    "year": 1979,
    "pages": 352,
    "rating": 1.2,
    "completed": true
  },
  {
    "id": "e4a43868-b30b-4dd6-bc02-c705d54b2d3b",
    "title": "Echoes of the Past 5",
    "author": "Zara Ahmed",
    "year": 1976,
    "pages": 352,
    "rating": 3.8,
    "completed": false
  },
  {
    "id": "cf5df05a-7dc4-4fa8-880a-97793665eee8",
    "title": "Memory Lane 8",
    "author": "Sarah Thompson",
    "year": 1960,
    "pages": 962,
    "rating": 3.0,
    "completed": false
  },
  {
    "id": "dc140f67-2b3d-4e4f-85ee-7e80816f7109",
    "title": "The Lost Empire 1",
    "author": "Emily Zhang",
    "year": 2015,
    "pages": 218,
    "rating": 1.3,
    "completed": false
  },
  {
    "id": "59cd182d-6276-4d0c-b0a2-c4d7d816b337",
    "title": "Memory Lane 15",
    "author": "Zara Ahmed",
    "year": 1996,
    "pages": 748,
    "rating": 2.0,
    "completed": false
  },
  {
    "id": "c74e1fe9-8122-4bb9-a844-69ebeea3121c",
    "title": "Beyond the Stars 4",
    "author": "David Kim",
    "year": 1983,
    "pages": 669,
    "rating": 1.8,
    "completed": true
  },
  {
    "id": "15c1c231-5980-4fde-b0f7-5f42eec0cca4",
    "title": "Shadows of Eternity 7",
    "author": "Maya Rao",
    "year": 1977,
    "pages": 944,
    "rating": 4.3,
    "completed": true
  },
  {
    "id": "c66eb7fd-caf3-484d-9aad-f98786d5d2e6",
    "title": "Code of Silence 3",
    "author": "Emily Zhang",
    "year": 1950,
    "pages": 877,
    "rating": 2.2,
    "completed": true
  },
  {
    "id": "9e5c4807-ab08-4cfd-b987-08b32afcfd0c",
    "title": "Echoes of the Past 9",
    "author": "A. K. Sharma",
    "year": 1983,
    "pages": 1056,
    "rating": 3.6,
    "completed": true
  },
  {
    "id": "3f448e8f-9671-483e-b266-9dd5b9133f6a",
    "title": "The Last Voyage 20",
    "author": "Yuki Nakamura",
    "year": 1954,
    "pages": 279,
    "rating": 2.0,
    "completed": true
  },
  {
    "id": "14432e4b-f0cf-4091-bd07-d21b79c9ace1",
    "title": "Infinite Skies 19",
    "author": "A. K. Sharma",
    "year": 2005,
    "pages": 954,
    "rating": 1.6,
    "completed": true
  },
  {
    "id": "e1840127-7386-4978-8a8f-8e3f10b0cb48",
    "title": "Echoes of the Past 15",
    "author": "Carlos Mendes",
    "year": 2006,
    "pages": 817,
    "rating": 1.0,
    "completed": false
  },
  {
    "id": "abd6da3d-9f63-4764-8e76-acda9156774a",
    "title": "Infinite Skies 1",
    "author": "Noah Patel",
    "year": 1972,
    "pages": 649,
    "rating": 4.2,
    "completed": false
  },
  {
    "id": "0ab324d6-b9bd-434f-bc6c-7ebebe8d9c09",
    "title": "Shadows of Eternity 5",
    "author": "Emily Zhang",
    "year": 1983,
    "pages": 704,
    "rating": 2.1,
    "completed": true
  },
  {
    "id": "d3a4487d-38a5-4361-8044-5afd1ff78d3f",
    "title": "Echoes of the Past 12",
    "author": "Noah Patel",
    "year": 1968,
    "pages": 247,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "4989ac96-6520-4b79-9214-3f3251b0e2c3",
    "title": "The Lost Empire 19",
    "author": "Carlos Mendes",
    "year": 1977,
    "pages": 903,
    "rating": 3.6,
    "completed": true
  },
  {
    "id": "9d6c9463-6509-4bf4-8564-6d1c04d048ed",
    "title": "The Lost Empire 4",
    "author": "Maya Rao",
    "year": 1956,
    "pages": 246,
    "rating": 1.5,
    "completed": true
  },
  {
    "id": "d0816c55-7ee0-4591-a169-8fd9901da574",
    "title": "Whispers in the Wind 2",
    "author": "David Kim",
    "year": 2006,
    "pages": 689,
    "rating": 1.2,
    "completed": false
  },
  {
    "id": "06289218-98de-4bee-bec8-d40f46326f52",
    "title": "The Lost Empire 11",
    "author": "Emily Zhang",
    "year": 1969,
    "pages": 861,
    "rating": 3.3,
    "completed": false
  },
  {
    "id": "6a31adf0-d967-4100-92ce-21a57fb17a55",
    "title": "Shadows of Eternity 20",
    "author": "David Kim",
    "year": 2006,
    "pages": 731,
    "rating": 4.9,
    "completed": true
  },
  {
    "id": "2c16807d-fc58-4bcf-a0c5-5cc4fe61be08",
    "title": "Memory Lane 13",
    "author": "David Kim",
    "year": 1971,
    "pages": 478,
    "rating": 4.9,
    "completed": true
  },
  {
    "id": "0687732f-6124-418a-9b59-3fef9062395d",
    "title": "Beyond the Stars 16",
    "author": "A. K. Sharma",
    "year": 1965,
    "pages": 680,
    "rating": 4.4,
    "completed": true
  },
  {
    "id": "a01f70e4-b46b-42da-99d7-59183aeb50c9",
    "title": "Shadows of Eternity 20",
    "author": "Maya Rao",
    "year": 2022,
    "pages": 111,
    "rating": 3.9,
    "completed": false
  },
  {
    "id": "28b4fb8f-2e73-4977-b734-63caa02897dd",
    "title": "Echoes of the Past 18",
    "author": "David Kim",
    "year": 1956,
    "pages": 1152,
    "rating": 2.6,
    "completed": false
  },
  {
    "id": "5f4bee88-5441-41d9-ae27-6cf167cf21a5",
    "title": "Code of Silence 20",
    "author": "Emily Zhang",
    "year": 2016,
    "pages": 957,
    "rating": 1.5,
    "completed": true
  },
  {
    "id": "a6c34bfb-2f27-4216-97fd-453f21d795d7",
    "title": "The Forgotten Kingdom 2",
    "author": "Zara Ahmed",
    "year": 1963,
    "pages": 555,
    "rating": 1.2,
    "completed": true
  },
  {
    "id": "307e2350-89bd-4b96-adf3-b0a78a23bfa8",
    "title": "The Last Voyage 5",
    "author": "Carlos Mendes",
    "year": 1980,
    "pages": 196,
    "rating": 4.6,
    "completed": false
  },
  {
    "id": "326ff55f-1841-4a67-95f6-d5f1d178a086",
    "title": "The Last Voyage 17",
    "author": "Emily Zhang",
    "year": 2018,
    "pages": 565,
    "rating": 2.1,
    "completed": false
  },
  {
    "id": "54eb84c3-22de-4c2b-ace1-85a864ac4191",
    "title": "Shadows of Eternity 13",
    "author": "Carlos Mendes",
    "year": 1992,
    "pages": 780,
    "rating": 4.0,
    "completed": false
  },
  {
    "id": "86f71140-c48f-4f4a-9c96-61303248ce4e",
    "title": "Code of Silence 2",
    "author": "Sarah Thompson",
    "year": 1957,
    "pages": 1094,
    "rating": 4.0,
    "completed": false
  },
  {
    "id": "2f2cc0eb-a267-4fa8-8234-1ddeaeeadb96",
    "title": "Whispers in the Wind 17",
    "author": "David Kim",
    "year": 1963,
    "pages": 314,
    "rating": 3.0,
    "completed": false
  },
  {
    "id": "c491e784-a3f7-4bc0-b40b-30529040db13",
    "title": "The Forgotten Kingdom 19",
    "author": "Carlos Mendes",
    "year": 1969,
    "pages": 1134,
    "rating": 3.2,
    "completed": false
  },
  {
    "id": "76795993-fe7c-453d-9ab0-93a433e7dc98",
    "title": "Memory Lane 3",
    "author": "Sarah Thompson",
    "year": 1994,
    "pages": 494,
    "rating": 1.8,
    "completed": true
  },
  {
    "id": "ca24ad9e-7c63-40cf-b002-bcccfa350f4b",
    "title": "Echoes of the Past 17",
    "author": "Carlos Mendes",
    "year": 1969,
    "pages": 1198,
    "rating": 4.9,
    "completed": true
  },
  {
    "id": "bca1873c-1f67-48f6-a295-d85e7b059ec3",
    "title": "Memory Lane 5",
    "author": "David Kim",
    "year": 1969,
    "pages": 662,
    "rating": 4.4,
    "completed": false
  },
  {
    "id": "e92917b5-256d-44d2-a75b-9f609912ed25",
    "title": "Echoes of the Past 17",
    "author": "Emily Zhang",
    "year": 2023,
    "pages": 614,
    "rating": 4.1,
    "completed": false
  },
  {
    "id": "e1d60a50-f41e-4c31-b5aa-686ad85fe964",
    "title": "Memory Lane 12",
    "author": "A. K. Sharma",
    "year": 2023,
    "pages": 761,
    "rating": 1.3,
    "completed": true
  },
  {
    "id": "68d82c0c-5e58-46b7-ad9b-32c236841184",
    "title": "The Lost Empire 7",
    "author": "A. K. Sharma",
    "year": 1976,
    "pages": 1144,
    "rating": 3.4,
    "completed": false
  },
  {
    "id": "25455d01-9a02-4f1e-a344-de0f733efa65",
    "title": "Echoes of the Past 9",
    "author": "Yuki Nakamura",
    "year": 2007,
    "pages": 819,
    "rating": 4.3,
    "completed": false
  },
  {
    "id": "1bec84c6-18ec-4d4d-96e9-f04c7081ee03",
    "title": "The Forgotten Kingdom 5",
    "author": "Zara Ahmed",
    "year": 1982,
    "pages": 663,
    "rating": 4.5,
    "completed": true
  }
]];

function genlib() {
  const gendata = libdata;

 gendata.forEach(innerArrey => {
  innerArrey.forEach(element => {
   addBookToLibrary(element);
   renderLibrary();
  });
 });
}

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'g') {
    event.preventDefault();
    genlib();
  }
});


});