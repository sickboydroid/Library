const library = new Map();
const newlyAddedBooks = [];
const library_div = document.querySelector("div.library");
const addNewBook_div = document.querySelector(".add-book");
const bookDetails_form = document.querySelector("form");
const removeBook_div = document.querySelector(".remove-book");
const addNewBook_dialog = document.querySelector("dialog#add-new-book");
const editBook_dialog = document.querySelector("dialog#edit-book");
const editHasRead_checkbox = document.querySelector("input#edit-has-read");

function Book(title, author, numPages, hasRead) {
  if (!(this instanceof Book)) throw new Error("Book() cannot be called as a function");
  this.title = title;
  this.author = author;
  this.numPages = numPages;
  this.hasRead = hasRead;
  do this.id = generateBookId(title);
  while (library.has(this.id));
  this.info = function () {
    return `${this.title} by ${this.author}, ${this.numPages} pages, ${this.hasRead}`;
  };
}

function addDummyBooks() {
  addBookToLibrary(new Book("The Mysterious Island", "Jules Verne", 620, true));
  addBookToLibrary(new Book("The Great Adventure", "John Doe", 340, false));
  addBookToLibrary(new Book("Whispers of the Past", "Jane Smith", 280, true));
  addBookToLibrary(new Book("Journey to the Unknown", "Emily Brontë", 450, false));
  addBookToLibrary(new Book("Long titles (like this one) are ellipsed", "sickboy", 40, false));
}

function generateBookId(title) {
  return `${title}(${Math.random()})`;
}

function addBookToLibrary(book) {
  library.set(book.id, book);
  newlyAddedBooks.push(book.id);
  updateLibraryDisplay();
}

function updateLibraryDisplay() {
  // remove books that aren't in library
  const books = library_div.querySelectorAll(".book");
  for (const book of books) {
    if (book.id === "book-template") continue;
    const bookId = getBookIdFromCard(book);
    if (!library.has(bookId)) book.remove();
  }

  // add books that aren't being displayed
  while (newlyAddedBooks.length) {
    const bookId = newlyAddedBooks.pop();
    const bookCard = createCardFromBook(library.get(bookId));
    library_div.appendChild(bookCard);
  }
}

function createCardFromBook(book) {
  const bookCard = document.querySelector("#book-template").cloneNode(true);
  bookCard.id = null; // remove book-template id
  bookCard.style.display = "flex";
  bookCard.querySelector(".title").textContent = book.title;
  bookCard.querySelector(".author-name").textContent = book.author;
  bookCard.querySelector(".num-pages").textContent = book.numPages + " pages";
  bookCard.onclick = () => openEditDialog(bookCard, book);
  updateReadStatus(bookCard, book);
  bookCard.querySelector(".remove-book").onclick = event => {
    removeBook(bookCard);
    event.stopPropagation(); // otherwise edit dialog will open
  };
  return bookCard;
}

function removeBook(bookCard) {
  library.delete(getBookIdFromCard(bookCard));
  updateLibraryDisplay();
}

function getBookIdFromCard(bookCard) {
  return bookCard.getAttribute("data-book-id");
}

function openEditDialog(bookCard, book) {
  editHasRead_checkbox.checked = book.hasRead;
  editBook_dialog.showModal();
  editHasRead_checkbox.onclick = e => {
    book.hasRead = !book.hasRead;
    updateReadStatus(bookCard, book);
    editBook_dialog.close();
  };
}

function updateReadStatus(bookCard, book) {
  const hasRead_div = bookCard.querySelector(".has-read");
  bookCard.setAttribute("data-book-id", book.id);
  if (book.hasRead) {
    hasRead_div.textContent = "Read";
    hasRead_div.classList.add("already-read");
  } else {
    hasRead_div.classList.remove("already-read");
    hasRead_div.textContent = "Not Read";
  }
}

function makeDialogCancelable(dialog) {
  dialog.onclick = event => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const dialogMinX = dialog.getBoundingClientRect().x;
    const dialogMaxX = dialogMinX + dialog.getBoundingClientRect().width;
    const dialogMinY = dialog.getBoundingClientRect().y;
    const dialogMaxY = dialogMinX + dialog.getBoundingClientRect().height;
    // check if mouse is out of dialog
    if (dialogMaxX < mouseX || mouseX < dialogMinX || dialogMaxY < mouseY || mouseY < dialogMinY)
      dialog.close();
  };
}

const dialogs = document.querySelectorAll("dialog");
[...dialogs].forEach(makeDialogCancelable);
addDummyBooks();

addNewBook_div.onclick = () => {
  addNewBook_dialog.showModal();
};

bookDetails_form.querySelector("#ok").onclick = e => {
  const title = bookDetails_form.querySelector("#title").value;
  const author = bookDetails_form.querySelector("#author").value;
  const numPages = bookDetails_form.querySelector("#num-pages").value;
  const hasRead = bookDetails_form.querySelector("#has-read").value === "on";
  addBookToLibrary(new Book(title, author, numPages, hasRead));
  updateLibraryDisplay();
};
