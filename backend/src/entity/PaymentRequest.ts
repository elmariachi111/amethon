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

  @Column("varchar", { nullable: true })
  fulfilledHash: string | null;

  @Column()
  address: string;

  @Column()
  priceInUSDCent: number;

  @ManyToOne(() => Book, (book) => book.payments)
  book: Book;
}
