import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { PaymentRequest } from "./PaymentRequest";

@Entity()
export class Book {
  @PrimaryColumn()
  ISBN: string;

  @Column()
  title: string;

  @Column()
  retailUSDCent: number;

  @OneToMany(
    () => PaymentRequest,
    (paymentRequest: PaymentRequest) => paymentRequest.book
  )
  payments: PaymentRequest[];
}
