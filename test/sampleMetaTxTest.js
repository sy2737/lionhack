// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { EIP712Domain, domainSeparator } = require('./testHelper.js');

const { expectRevert, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

// const Forwarder = artifacts.require('ScriptusForwarder');

const name = "ScriptusForwarder";
const version = "1";

describe('Forwarder', function () {
  beforeEach(async function () {
	// await Forwarder.new(name, version);
    this.Forwarder = await ethers.getContractFactory("ScriptusForwarder");
    this.forwarder = await this.Forwarder.deploy()
    this.domain = {
      name,
      version,
      chainId: await web3.eth.getChainId(),
      verifyingContract: this.forwarder.address,
    };
    this.types = {
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
  });

  context('with message', function () {
    beforeEach(async function () {
      this.wallet = Wallet.generate();
      this.sender = web3.utils.toChecksumAddress(this.wallet.getAddressString());
      this.req = {
        from: this.sender,
        to: constants.ZERO_ADDRESS,
        value: '0',
        gas: '100000',
        nonce: Number(await this.forwarder.getNonce(this.sender)),
        data: '0x',
      };
      this.sign = ethSigUtil.signTypedMessage(
        this.wallet.getPrivateKey(), {
          data: {
            types: this.types,
            domain: this.domain,
            primaryType: 'ForwardRequest',
            message: this.req,
          },
        },
      );
    });

    context('verify', function () {
      context('valid signature', function () {

        it('success', async function () {
          expect(await this.forwarder.verify(this.req, this.sign)).to.be.equal(true);
        });

      });
	});
  });


});