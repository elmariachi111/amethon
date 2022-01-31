import cors from "cors";
import express, { Express, Request, Response } from "express";
import { createConnection } from "typeorm";

const app: Express = express();

app.set("json spaces", 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust first proxy

app.use(cors());

app.get("/books", async (req: Request, res: Response) => {
  res.send("Foo");
});

app.get("/books/:address", async (req: Request, res: Response) => {
  res.send("Foo");
});

app.get("/books/:isbn/download", async (req: Request, res: Response) => {
  res.send("Foo");
});

createConnection({
  type: "sqlite",
  database: "books.sqlite",
  entities: [__dirname + "/entity/*.js"],
  synchronize: true,
});

export default app;
