const chai = require("./chaisetup.js");
const expect = chai.expect;
const ethSigUtil = require('eth-sig-util');
const { EIP712Domain, domainSeparator } = require('./testHelper.js');
const Wallet = require('ethereumjs-wallet').default;

describe("ScriptusForwarder Contract Test", function () {
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
	let forwarder;
	let domain;
	let types;
	let emptyWallet;
	let emptySender;

	before(async function () {
		this.Forwarder = await ethers.getContractFactory("ScriptusForwarder");
		this.ScriptToken = await ethers.getContractFactory("ScriptToken");
		this.MarketPlace = await ethers.getContractFactory("ScriptusMarket");
	    [deployer, author, collector] = await ethers.getSigners();

		forwarder = await this.Forwarder.deploy();
		await forwarder.deployed();

		scriptToken = await this.ScriptToken.deploy("/my/test/uri", forwarder.address);
		await scriptToken.deployed();
		scriptTokenAsDeployer = scriptToken.connect(deployer);
		scriptTokenAsAuthor = scriptToken.connect(author);
		scriptTokenAsCollector = scriptToken.connect(collector);

		marketPlace = await this.MarketPlace.deploy(scriptToken.address, deployer.address, TakerFeePercentage);
		await marketPlace.deployed();
		marketPlaceAsDeployer = marketPlace.connect(deployer);
		marketPlaceAsAuthor = marketPlace.connect(author);
		marketPlaceAsCollector = marketPlace.connect(collector);
        

		emptyWallet = Wallet.generate();
		emptySender = web3.utils.toChecksumAddress(emptyWallet.getAddressString());
		const chainId = await web3.eth.getChainId();
		// const { chainId } = await ethers.getDefaultProvider().getNetwork();
     	domain = {
			name: "ScriptusForwarder",
			version: "1",
			chainId: chainId,
			verifyingContract: forwarder.address,
		};
		types = {
			EIP712Domain,
			ForwardRequest: [{
				name: 'from',
				type: 'address'
			  },
			  {
				name: 'to',
				type: 'address'
			  },
			  {
				name: 'value',
				type: 'uint256'
			  },
			  {
				name: 'gas',
				type: 'uint256'
			  },
			  {
				name: 'nonce',
				type: 'uint256'
			  },
			  {
				name: 'data',
				type: 'bytes'
			  },
			],
		};
	})
	beforeEach(async function () {
	})

	it("Verify an empty request", async () => {
		const req = {
			from: emptySender,
			to: ethers.constants.AddressZero,
			value: '0',
			gas: '100000',
			nonce: Number(await forwarder.getNonce(emptySender)),
			data: '0x'
		}
		const sig = ethSigUtil.signTypedMessage(
			emptyWallet.getPrivateKey(),
			{
			  data: {
				types: types,
				domain: domain,
				primaryType: 'ForwardRequest',
				message: req,
			  },
			},
		  );

		expect(await forwarder.verify(req, sig)).to.be.equal(true);
	})

	it("An emptySender can gas-lessly approve ScriptusMarket as operator by using deployer as paymentMaster.", async () => { 
		let ABI = ["function setApprovalForAll(address operator,bool approved)"
	    ];
		let iface = new ethers.utils.Interface(ABI);
		let encodedFunctionCall = iface.encodeFunctionData(
			"setApprovalForAll", 
			[marketPlace.address, true]
		)
		// console.log(encodedFunctionCall);

		const req = {
			from: emptySender,
			to: scriptToken.address,
			value: '0',
			gas: '100000',
			nonce: Number(await forwarder.getNonce(emptySender)),
			data: encodedFunctionCall
		}
		const sig = ethSigUtil.signTypedMessage(
			emptyWallet.getPrivateKey(),
			{
			  data: {
				types: types,
				domain: domain,
				primaryType: 'ForwardRequest',
				message: req,
			  },
			},
		  );

		expect(await forwarder.verify(req, sig)).to.be.equal(true);
		expect(await forwarder.connect(deployer).verify(req, sig)).to.be.equal(true);
		// expect(await forwarder.connect(deployer).execute(req, sig)).to.be.fulfilled;
		// Question: for some reason the above does not work, the following one works.
		await expect(forwarder.connect(deployer).execute(req, sig)).to.eventually.be.fulfilled;

		expect(await scriptToken.isApprovedForAll(emptySender, marketPlace.address)).to.be.equal(true);
	});


});
