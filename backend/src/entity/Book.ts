import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Book {
  @PrimaryColumn()
  ISBN: string;

  @Column()
  title: string;

  @Column()
  price: string;
}
