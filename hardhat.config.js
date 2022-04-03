require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("@nomiclabs/hardhat-web3");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",

  paths: {
    // artifacts: "./client/src/artifacts",
    // deployments: "./client/src/deployments"
  },

  namedAccounts: {
    deployer: 0,
    tokenOwner: 1,
  },
};
