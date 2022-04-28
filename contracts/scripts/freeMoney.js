//mints 100 free "DAI" to each account
module.exports = async (callback) => {
  const accounts = await web3.eth.getAccounts();

  const StableCoin = await artifacts.require('StableCoin');
  const stableCoin = await StableCoin.deployed();

  const promises = [];
  for(let account of accounts) {
    promises.push(stableCoin.freeMoney(account, web3.utils.toWei("100", "ether")));
    console.log("sent 100 coins (%s) to %s", stableCoin.address, account);
  }
  await Promise.all(promises);
  callback()
}