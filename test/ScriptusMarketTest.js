const chai = require("./chaisetup.js");
const expect = chai.expect;

describe("ScriptusMarket Contract", function () {
	const TotalCirculation = 100;
	const TakerFeePercentage = 20;
	let scriptToken;
	let scriptTokenAsDeployer;
	let scriptTokenAsAuthor;
	let scriptTokenAsCollector;
	let deployer;
	let author;
	let collector;
	let marketPlace;
	let marketPlaceAsDeployer;
	let marketPlaceAsAuthor;
	let marketPlaceAsCollector;

	before(async function () {
		this.ScriptToken = await ethers.getContractFactory("ScriptToken");
		this.MarketPlace = await ethers.getContractFactory("ScriptusMarket");
	    [deployer, author, collector] = await ethers.getSigners();

		scriptToken = await this.ScriptToken.deploy("/my/test/uri", ethers.constants.AddressZero);
		await scriptToken.deployed();
		scriptTokenAsDeployer = scriptToken.connect(deployer);
		scriptTokenAsAuthor = scriptToken.connect(author);
		scriptTokenAsCollector = scriptToken.connect(collector);

		marketPlace = await this.MarketPlace.deploy(scriptToken.address, deployer.address, TakerFeePercentage);
		await marketPlace.deployed();
		marketPlaceAsDeployer = marketPlace.connect(deployer);
		marketPlaceAsAuthor = marketPlace.connect(author);
		marketPlaceAsCollector = marketPlace.connect(collector);
	})
	beforeEach(async function () {
	})

	it("Author can approve ScriptusMarket as operator.", async () => { 
		await expect(scriptTokenAsAuthor.setApprovalForAll(marketPlace.address, true)).to.eventually.be.fulfilled;
		});


	it("Owner can list paper.", async () => { 
		const paperSourceHash = "0000000";
	    await scriptTokenAsAuthor.writePaper([author.address], [TotalCirculation], paperSourceHash);
		const tokenId = 1;
		const unitPrice = 1000;
        await expect(marketPlaceAsAuthor.listItemPostedPrice(tokenId, unitPrice, TotalCirculation)).to.be.eventually.fulfilled;
		await expect(scriptToken.balanceOf(author.address, tokenId)).to.eventually.be.equal(0);
		await expect(scriptToken.balanceOf(marketPlace.address, tokenId)).to.eventually.be.equal(TotalCirculation);

		});

	it("Collector can purchase listed paper.", async () => {
        const tokenId = 1;
		const purchaseAmount = 50;
		const {0:txValue, 1:totalValue} = await marketPlaceAsCollector.calculatePostedPricePurchasePayment(tokenId, author.address, purchaseAmount);
		await expect(await marketPlaceAsCollector.purchaseItemPostedPrice(tokenId, author.address, purchaseAmount, {value: totalValue})).to.changeEtherBalances([author, collector], [txValue, -totalValue]);
		await expect(scriptTokenAsCollector.balanceOf(collector.address, tokenId)).to.eventually.be.equal(purchaseAmount);
		await expect(scriptTokenAsCollector.balanceOf(marketPlace.address, tokenId)).to.eventually.be.equal(TotalCirculation - purchaseAmount);
		});
});
