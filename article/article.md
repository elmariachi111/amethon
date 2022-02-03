# Paying with Crypto for a classical commerce app

E-commerce storefronts are surprisingly slowly adapting crypto tokens as a payment method. Crypto payment plugins or payment gateway integrations aren't generally available or rely on a 3rd party custodian to collect, exchange and distribute revenues. Considering the growing ownership rate and experimentation ratio of crypto currencies, a "pay with token" button could be a great addition to any online shop to drive sales. Here we demonstrate how you can integrate a secure crypto payment method into any online store without relying on any 3rd party service.

## Scenario: the amethon bookstore

The goal is to build a storefront for downloadable ebooks that accepts the blockchain's native Ether currency and ERC20 stablecoins (pegged in USD) as payment which allows us to do without an external exchange rate service apart from an updated ETH/USD rate that we will just assume fixed for simplicity's sake.

## application structure

The store is built as a very plain express CRUD API with no direct connection to any blockchain. Its frontend relies on a plain Create React App setup and the settlement layer consists of an Ethereum smart contract that accepts Ether and ERC20 payments.

Amethon is "classic" ecommerce application so it must take care of the business logic itself. To initiate the checkout transaction the backend creates a `PaymentRequest` object with an unique identifier that users are supposed to send along their payment transaction. Once the payment has settled, a permanently running daemon listens to corresponding payment events emitted by the contract layer and updates the store's database when a payment has settled. To authenticate requests for the final download step the backend requires the customer's individual signature. The full Amethon implementation can be found on our [github repo](https://github.com/elmariachi111/amethon).

### The PaymentReceiver contract

The heart of our bookstore is an Ethereum `PaymentReceiver` smart contract that accepts payments on behalf of the storefront owner. Provided they don't contain any errors themselves, smart contracts can be considered trustworthy fund keepers and hence are a great place to store income. Every time a user sends funds to the `PaymentReceiver` contract, it emits an `PaymentReceived` event that contains information about the payment origin (the buyer's Ethereum account), its total value, the token contract used, and the `paymentId` that all interactions refer to.

```solidity
  event PaymentReceived(
    address indexed buyer,
    uint256 value,
    address token,
    bytes32 paymentId
  );
```

Ethereum contract accounts act in the same way as any other user based account (called "externally owned" or EOA) but allow us to overwrite default functions that are invoked when someone transfers Ether funds to the contract:

```solidity
  receive() external payable {
    emit PaymentReceived(msg.sender, msg.value, ETH_ADDRESS, bytes32(0));
  }

  fallback() external payable {
    emit PaymentReceived(
      msg.sender, msg.value, ETH_ADDRESS, bytes32(msg.data));
  }
```

[Solidity's official docs](https://docs.soliditylang.org/en/v0.8.11/contracts.html?highlight=receive#special-functions) point out the subtle differences between both: `receive` is a default function invoked when the incoming transaction doesn't contain any additional data, otherwise `fallback` gets called. Ethereum's native currency is not an ERC20 token itself and has no utility besides being a counting unit but it got its own identifiable address (`0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`) that goes into the emitted payment event.

Plain Ether transfers come with a caveat: the amount of computation allowed upon reception is extremely low. The gas sent along by users merely allow us to emit an event but not to redirect funds to the store owner's original address. We therefore decided to have the receiver contract keep all incoming Ethers and allow the store owner to release them to their own account at any time:

```solidity
function getBalance() public view returns (uint256) {
  return address(this).balance;
}

function release() external onlyOwner {
  (bool ok, ) = _owner.call{value: getBalance()}("");
  require(ok, "Failed to release Eth");
}
```

Accepting ERC20 tokens as a payment is slightly more difficult for historical reasons. In 2015 the authors of its [initial specification](https://eips.ethereum.org/EIPS/eip-20) couldn't predict the upcoming requirements and kept the standard's interface as simple as possible. This effectively means that there's no way for a contract to figure out whether someone sent ERC20 to it because there simply is no universally accepted callback mechanism in the plain specification. Today things are different, though: The [EIP 1363](https://eips.ethereum.org/EIPS/eip-1363) standard is addressing this very problem but [it is not implemented](https://twitter.com/ahmetaygun/status/1462168627159916554?s=20&t=9JFFvtuCHGQpCc7iCK8N1Q) by major stablecoin platforms.

The traditional way for a contract to accept ERC20 tokens is to create their own acceptance method which transfers funds on behalf of the current user. The commonly accepted tradeoff here is that users must first allow the contract to do so which unfortunately currently requires them to first send an `Approval` transaction to the ERC20 token contract before interacting with the real payment method. [EIP-2612](https://github.com/ethereum/EIPs/issues/2613) might once improve this situation but for now we have to play by the rules:

```solidity
  function payWithErc20(
    IERC20 erc20,
    uint256 amount,
    uint256 paymentId
  ) external {
    erc20.transferFrom(msg.sender, _owner, amount);
    emit PaymentReceived(
      msg.sender,
      amount,
      address(erc20),
      bytes32(paymentId)
    );
  }
```

![Metamask Approval dialog for ERC20 transfers](./erc20_permission.png "Metamask's user facing approval transaction dialog")

### Compiling and Deploying

There are several toolchains that allow you to compile, deploy and interact with smart contracts, but one of the most advanced ones is the [Truffle Suite](https://trufflesuite.com/). It comes with a builtin develoment blockchain based on Truffle's Ganache and a migration concept that lets you automate and safely execute contract deployments. To be able to deploy on "real" blockchain infrastructure, such as Ethereum testnets, one needs two things: an Ethereum provider that's connected to a blockchain node and the private keys of an account that can sign transactions on behalf of the user and has some Ethers on it to pay for gas fees during deployment.

An account can be created and exported easily using Metamask: just create another account you're not using for anything else, fund it with some Eth using the testnet's faucet (we can recommend [Paradigm](https://faucet.paradigm.xyz/)) and export its private key using "Account Details" > "Export Private Key". For security reasons keys **never** must be committed to your code; our examples makes use of `.env` files instead: you can copy all packages' `.env` files to a gitignored `.env.local` and override the values safely, e.g. the `DEPLOYER_PRIVATEKEY` variable.

Connecting to the Ethereum network requires access to a synced node. While you certainly could download one of the many clients and wait some days to have it synced on your machine, the by far much simpler and industry wide accepted solution is to connect to Ethereum nodes that are offered as a service, e.g. by [Infura](https://infura.io/). Their free tier provides you with 3 different access keys and 100k RPC requests per month and they support a wide range of Ethereum networks. Once signed up take note of your Infura key and put it in your `contracts` `.env.local` as `INFURA_KEY`.

![Infura keys](./infura_keys.png "getting keys to access nodes on the Infura infrastructure")

Our `truffle.config.js` shows how everything fits together:

```
 const HDWalletProvider = require('@truffle/hdwallet-provider');
 const dotenv = require('dotenv-flow');
 dotenv.config();

 module.exports = {
   networks: {
     kovan: {
       provider: () => new HDWalletProvider({
         privateKeys: process.env.DEPLOYER_PRIVATEKEY.split(","),
         url: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`
       }),
       network_id: 42, // Kovan
       gas: 5000000,
       confirmations: 1,
       timeoutBlocks: 200,
       skipDryRun: false
     }
   },
   compilers: {
     solc: {
       version: "0.8.11",

     }
   }
 };
```

For your local development setup you won't need any further setup. To start a local blockchain with prefunded accounts, just change to the `contracts` folder, execute a `yarn develop`. You can build the contracts by issuing a `compile` command and deploy them on your devnet with `migrate`. To interact with the deployed instances from inside the console you first get a deployed instance and call methods on it:

```
pr = await PaymentReceiver.deployed()
balance = await pr.getBalance()
```

## backend

#### the store API / CRUD

#### a listener daemon

### frontend

#### connecting to web3

## usage

### paying with ETH

### paying with Stablecoins

### signing download requests

## Deploying on a public testnet

## Outlook
