var TokenOwnership = artifacts.require("./TokenOwnership.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenOwnership);
};
