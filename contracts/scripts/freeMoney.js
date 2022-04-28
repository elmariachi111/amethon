//mints 100 free "DAI" to each account
module.exports = async (callback) => {
  const accounts = await web3.eth.getAccounts();

  const StableCoin = await artifacts.require('StableCoin');
  const stableCoin = await StableCoin.deployed();
  const promises = [];
  for(let account of accounts) {
    console.log(account);
    promises.push(stableCoin.freeMoney(account, web3.utils.toWei("100", "ether")));
  }
  await Promise.all(promises);
  callback()
}