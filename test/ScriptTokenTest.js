const chai = require("./chaisetup.js");
const expect = chai.expect;

describe("ScriptToken Contract", function () {
	const TotalCirculation = 100;
	let scriptToken;
	let scriptTokenAsDeployer;
	let scriptTokenAsAuthor;
	let scriptTokenAsCollector;
	let deployer;
	let author;
	let collector;

	before(async function () {
		this.ScriptToken = await ethers.getContractFactory("ScriptToken");
	    [deployer, author, collector] = await ethers.getSigners();
	})
	beforeEach(async function () {
		scriptToken = await this.ScriptToken.deploy("/my/test/uri", ethers.constants.AddressZero);
		await scriptToken.deployed();
		scriptTokenAsDeployer = scriptToken.connect(deployer);
		scriptTokenAsAuthor = scriptToken.connect(author);
		scriptTokenAsCollector = scriptToken.connect(collector);
	})

	it("Single author can mint paper, and the first tokenID should be 1.", async () => { 
		const paperSourceHash = "0000000";
	    const tx = await scriptTokenAsAuthor.writePaper([author.address], [TotalCirculation], paperSourceHash);
		const receipt = await tx.wait();
		const paperId = receipt.events.filter((x) => {return x.event == "PaperCreation"})[0].args["paperId"];
		expect(scriptToken.balanceOf(author.address, paperId)).to.eventually.be.equal(TotalCirculation);
		expect(paperId).to.be.equal(1);
		});

	it("Author can transfer paper ownership, and others cannot", async () => {
		const paperSourceHash = "0000000";
	    const tx = await scriptTokenAsAuthor.writePaper([author.address], [TotalCirculation], paperSourceHash);
		const receipt = await tx.wait();
		const paperId = receipt.events.filter((x) => {return x.event == "PaperCreation"})[0].args["paperId"];

		await expect(scriptTokenAsDeployer.safeTransferFrom(author.address, collector.address, paperId, TotalCirculation, 0x0)).to.be.reverted;
		await expect(scriptTokenAsAuthor.safeTransferFrom(author.address, collector.address, paperId, TotalCirculation, 0x0)).to.be.fulfilled;
		await expect(scriptToken.balanceOf(collector.address, paperId)).to.eventually.be.equal(TotalCirculation);
		await expect(scriptToken.balanceOf(author.address, paperId)).to.eventually.be.equal(0);
		});
});
