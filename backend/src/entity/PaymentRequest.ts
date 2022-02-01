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

  @Column("mediumint", { nullable: true })
  paidUSDCent: number;

  @ManyToOne(() => Book, (book) => book.payments)
  book: Book;
}
