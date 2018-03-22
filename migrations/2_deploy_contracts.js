var LicensePurchase = artifacts.require("./LicensePurchase.sol");

module.exports = function(deployer) {
  deployer.deploy(LicensePurchase);
};
