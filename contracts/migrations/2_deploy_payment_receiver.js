const PaymentReceiver = artifacts.require("PaymentReceiver");

module.exports = function (deployer) {
  deployer.deploy(PaymentReceiver);
};
