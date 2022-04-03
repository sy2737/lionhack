const path = require("path");
require("dotenv").config({path: "./.env"});

module.exports = async ({getNamedAccounts, deployments}) => {
	const {deploy} = deployments;
	const {deployer} = await getNamedAccounts();
	const scriptTokenInstance = await deploy('ScriptToken', {
	  from: deployer,
	  args: ['/my/test/uri'],
	  log: true,
	});

	const scriptusMarketInstance = await deploy('ScriptusMarket', {
		from: deployer,
		args: [scriptTokenInstance.address, deployer, process.env.DEFAULT_TAKER_FEE_PERCENTAGE],
		log: true,
	  });
  };
  module.exports.tags = ['ScriptToken and ScriptusMarket'];