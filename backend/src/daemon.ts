import { default as Web3 } from "web3";
import dotenv from "dotenv-flow";
import paymentReceiverAbi from "./abi/PaymentReceiver.json";
import { AbiItem } from "web3-utils";
import { createConnection } from "typeorm";
import { PaymentRequest } from "./entity/PaymentRequest";

dotenv.config();
const web3 = new Web3(process.env.PROVIDER_RPC as string);
const ETH_USD_CENT = 2_200 * 100;

const ACCEPTED_USD_TOKENS = (process.env.STABLECOINS as string).split(",");
const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

interface PaymentReceivedEvent {
  blockNumber: number;
  transactionHash: string;
  returnValues: {
    buyer: string;
    value: string; //wei
    token: string;
    paymentId: string;
  };
}

(async () => {
  const connection = await createConnection({
    type: "sqlite",
    database: "books.sqlite",
    entities: [__dirname + "/entity/*.js"],
    synchronize: true,
  });
  const paymentRepo = connection.getRepository(PaymentRequest);

  const handlePaymentEvent = async (event: PaymentReceivedEvent) => {
    const args = event.returnValues;
    const paymentId = web3.utils.hexToNumber(args.paymentId);
    const payment = await paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      return console.error(`payment [${paymentId}] not found`);
    }
    const decimalValue = web3.utils.fromWei(args.value);
    let valInUSDCents;
    if (args.token === NATIVE_ETH) {
      valInUSDCents = parseFloat(decimalValue) * ETH_USD_CENT;
    } else {
      if (!ACCEPTED_USD_TOKENS.includes(args.token)) {
        return console.error("payments of that token are not supported");
      }
      valInUSDCents = parseFloat(decimalValue) * 100;
    }

    if (valInUSDCents < payment.priceInUSDCent) {
      return console.error(`payment [${paymentId}] not sufficient`);
    }

    payment.paidUSDCent = valInUSDCents;
    payment.fulfilledHash = event.transactionHash;
    await paymentRepo.save(payment);
    console.info(`sucessfully paid [${paymentId}]`);
  };

  const paymentReceiver = new web3.eth.Contract(
    paymentReceiverAbi as AbiItem[],
    process.env.PAYMENT_RECEIVER_CONTRACT as string
  );

  const emitter = paymentReceiver.events.PaymentReceived({
    fromBlock: "0",
  });

  console.log(`listening for payment events on contract ${paymentReceiver.options.address}`);

  emitter.on("data", (evt: PaymentReceivedEvent) => {
    try {
      handlePaymentEvent(evt);
    } catch (e: any) {
      console.error(e.message);
    }
  });
})();
