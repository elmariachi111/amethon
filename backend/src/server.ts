import cors from "cors";
import express, { Express, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Book } from "./entity/Book";
import { PaymentRequest } from "./entity/PaymentRequest";

const app: Express = express();

app.set("json spaces", 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust first proxy

app.use(cors());

app.get("/books", async (req: Request, res: Response) => {
  const books = await getRepository(Book).find();
  res.json(books);
});

interface BuyBookRequest extends Request {
  body: {
    address: string;
  };
}

app.post("/books/:isbn/order", async (req: BuyBookRequest, res: Response) => {
  const book = await getRepository(Book).findOne(req.params.isbn);
  if (!book) {
    return res.status(404).send("book not found");
  }
  if (!req.body.address) {
    return res.status(401).send("no address provided");
  }
  const _paymentRequest = new PaymentRequest();
  _paymentRequest.book = book;
  _paymentRequest.address = req.body.address;
  _paymentRequest.priceInUSDCent = book.retailUSDCent;
  _paymentRequest.fulfilledHash = null;
  const paymentRequest = await getRepository(PaymentRequest).save(
    _paymentRequest
  );
  res.json({
    paymentRequest,
    receiver: process.env.PAYMENT_RECEIVER_CONTRACT as string,
  });
});

interface DownloadBookRequest extends Request {
  body: {
    address: string;
    nonce: string;
    signature: string;
  };
}

app.post(
  "/books/:isbn/download",
  async (req: DownloadBookRequest, res: Response) => {
    //todo verify post body signature for address
    const paymentRequest = await getRepository(PaymentRequest).findOne({
      where: {
        book: { ISBN: req.params.isbn },
        address: req.body.address,
      },
      relations: ["book"],
    });

    res.json({ payment: paymentRequest, content: "the content..." });
  }
);

export default app;
