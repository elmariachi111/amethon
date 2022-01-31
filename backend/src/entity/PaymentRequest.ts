import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Book } from "./Book";

@Entity()
export class PaymentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fulfilled: boolean;

  @Column()
  address: string;

  @ManyToOne(() => Book, (book) => book.payments)
  book: Book;
}
