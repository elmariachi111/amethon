const StableCoin = artifacts.require("StableCoin");

module.exports = function (deployer) {
  deployer.deploy(StableCoin, "10000000000000000000");
};
