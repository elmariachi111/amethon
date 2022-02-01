import { createConnection } from "typeorm";
import { Book } from "./entity/Book";

const BOOKS = [
  {
    isbn: "979-8749522310",
    title: "Alice in Wonderland",
    priceUSDCent: 597,
  },
  {
    isbn: "978-0345806789",
    title: "The Shining",
    priceEth: "",
    priceUSDCent: 999,
  },
  {
    isbn: "978-0060850524",
    title: "Brave New World",
    priceEth: "",
    priceUSDCent: 1034,
  },
];

(async () => {
  const connection = await createConnection({
    type: "sqlite",
    database: "books.sqlite",
    entities: [__dirname + "/entity/*.js"],
    synchronize: true,
  });
  const bookRepo = connection.getRepository(Book);

  for await (const _book of BOOKS) {
    const book = new Book();
    book.ISBN = _book.isbn;
    book.title = _book.title;
    book.retailUSDCent = _book.priceUSDCent;
    book.payments = [];
    await bookRepo.save(book);
  }
  console.log("books written");
})();
