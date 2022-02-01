import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BookView } from './components/BookView';
import { Book } from './types';


export const BookInventory = () => {
  
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const url = `${process.env.REACT_APP_BOOK_SERVER}/books`;

    (async () => {
      setBooks(await (await axios.get<Book[]>(url)).data);
    } )();
  }, []);

  return <div>
    
      {books.map(book => (
        <BookView book={book} key={`${book.ISBN}`} />    
      ))}
    
  </div>
  
};

