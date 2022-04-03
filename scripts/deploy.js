async function main() {
	const [deployer, author, collector] = await ethers.getSigners();
	const TakerFeePercentage = 20;
  
	console.log("Deploying contracts with the account:", deployer.address);
  
	console.log("Account balance:", (await deployer.getBalance()).toString());
  
	const ScriptToken = await ethers.getContractFactory("ScriptToken");
	const ScriptusMarket = await ethers.getContractFactory("ScriptusMarket");

	const token = await ScriptToken.deploy("my/test/uri");
	const market = await ScriptusMarket.connect(deployer).deploy(token.address, deployer.address, TakerFeePercentage);
  
	console.log("Token address:", token.address);
	console.log("Market address:", market.address);
}
  
main()
.then(() => process.exit(0))
.catch((error) => {
	console.error(error);
	process.exit(1);
});