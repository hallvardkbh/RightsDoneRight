var TokenOwnership = artifacts.require("./TokenOwnership.sol");
var WorkBase = artifacts.require("./WorkBase.sol");

module.exports = function(deployer) {
  deployer.deploy(WorkBase);
  deployer.deploy(TokenOwnership);
};
