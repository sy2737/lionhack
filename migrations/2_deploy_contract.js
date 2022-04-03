var PaperCoin= artifacts.require("PaperCoin1155");
// require("dotenv").config({path: "../.env"});
// console.log(process.env);
module.exports = async function(deployer) {
	// deployer is something that truffle gives us! 
	// let addr = await web3.eth.getAccounts();
	// await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
	// await deployer.deploy(MyKycContract);
	// await deployer.deploy(MyTokenSale, 1, addr[0], MyToken.address, MyKycContract.address);

	// let instance = await MyToken.deployed();
	// await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
	await deployer.deploy(PaperCoin,"https://token-cdn-domain/{id}.json");
};