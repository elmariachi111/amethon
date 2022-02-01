import cors from "cors";
import express, { Express, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Book } from "./entity/Book";
import { PaymentRequest } from "./entity/PaymentRequest";
import { default as Web3 } from "web3";

const app: Express = express();

app.set("json spaces", 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1); // trust first proxy

app.use(cors());

const web3 = new Web3(process.env.PROVIDER_RPC as string);

app.get("/books", async (req: Request, res: Response) => {
  const books = await getRepository(Book).find();
  res.json(books);
});

interface BuyBookRequest extends Request {
  body: {
    address: string;
  };
}

app.get(
  "/books/:isbn/payments/:address",
  async (req: Request, res: Response) => {
    const paymentRequest = await getRepository(PaymentRequest).findOne({
      where: {
        book: { ISBN: req.params.isbn },
        address: req.params.address,
      },
      relations: ["book"],
    });
    if (!paymentRequest)
      return res
        .status(404)
        .send(`no payment by ${req.params.address} for that book`);

    return res
      .status(200)
      .json({
        paymentRequest,
        receiver: process.env.PAYMENT_RECEIVER_CONTRACT as string,
      });
  }
);

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
    const { signature, address, nonce } = req.body;

    const signedMessage = Web3.utils.keccak256(
      `${address}${req.params.isbn}${nonce}`
    );

    const signingAccount = await web3.eth.accounts.recover(
      signedMessage,
      signature,
      false
    );

    if (signingAccount !== address) {
      return res.status(401).json({ error: "not signed by address" });
    }

    const paymentRequest = await getRepository(PaymentRequest).findOne({
      where: {
        book: { ISBN: req.params.isbn },
        address,
      },
      relations: ["book"],
    });

    if (!paymentRequest) {
      return res.status(404).json({ error: "payment transaction not found" });
    }
    res.set("Content-Type", "text/plain");
    res.set(
      "Content-Disposition",
      `attachment; filename=${paymentRequest.book.title}.txt`
    );

    res.end(Buffer.from("the books content", "utf-8"));
  }
);

export default app;
