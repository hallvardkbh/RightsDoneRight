var TokenOwnersip = artifacts.require("./TokenOwnersip.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenOwnersip);
};
