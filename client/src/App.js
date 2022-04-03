import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import {ethers} from "ethers";
import "./App.css";

class App extends Component {
  state = {loaded: false, paperSourceCode: "We prove that P!=NP.", paperSourceTitle: "The Unreasonably Effectiveness of Reason", userTokens:0,
  tokenCirculation:0, authorAddresses:"", targetTokenID:0, targetTokenIDsend:0,
  recipientAddress:"", sendAmount:0, viewTitle:"", viewTokenID:0, viewAuthors:"", viewAbstract:"",
  sellTokenID:0, sellTokenAmount:0, sellTokenUnitPrice:0,
  buyTokenID:0, buyTokenAmount:0, buyTokenSeller:"", buyTotalPrice:0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      var deployments = require("./deployments.json");


      // Switch to using ethers.js in the future.
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // await provider.send("eth_requestAccounts", []);
      // const signer = provider.getSigner();


      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();
      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        this.accounts = accounts;
        console.log("Active accounts switched to "+ accounts[0]);
       });

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      // this.ScriptTokenInstance = new ethers.Contract(
      //   deployments.contracts.ScriptToken.address,
      //   deployments.contracts.ScriptToken.abi,
      // );
      this.ScriptTokenInstance = new this.web3.eth.Contract(
        deployments.contracts.ScriptToken.abi,
        deployments.contracts.ScriptToken.address,
      );
      this.ScriptusMarketInstance = new this.web3.eth.Contract(
        deployments.contracts.ScriptusMarket.abi,
        deployments.contracts.ScriptusMarket.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToPaperTransfer();
      this.setState({loaded: true},this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  };
  handlePaperSourceTitleChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  };

  handleCirculationChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleAuthorsChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleTokenIDChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleTokenIDSendChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleViewTokenIDChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  recipientAddressChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }

  sendAmountChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }

  handleSellTokenIDChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleSellTokenAmountChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleSellTokenPriceChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }


  handleBuyTokenIDChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleBuyTokenAmountChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }
  handleBuyTokenSellerChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value; 
    const name = target.name;
    this.setState({
      [name]: value 
    });
  }

  updateUserTokens = async() => {
    // let _userTokens = await this.ScriptTokenInstance.methods.balanceOf(this.accounts[0]).call();
    // this.setState({userTokens: _userTokens});
  }

  listenToPaperTransfer= async() => {
    this.ScriptTokenInstance.events.TransferSingle({to: this.accounts[0]}).on("data", this.updateUserTokens);
    this.ScriptTokenInstance.events.TransferSingle({from: this.accounts[0]}).on("data", this.updateUserTokens)
    this.ScriptTokenInstance.events.TransferBatch({to: this.accounts[0]}).on("data", this.updateUserTokens);
    this.ScriptTokenInstance.events.TransferBatch({from: this.accounts[0]}).on("data", this.updateUserTokens)
  }

  handleMint= async() => {
    let paperSourceHash = this.web3.utils.keccak256(this.state.paperSourceCode);
    let authors = [this.state.authorAddresses];
    let amounts = [this.state.tokenCirculation];
    let abstract = this.state.paperSourceCode;
    let title = this.state.paperSourceTitle;
    let returnObj = await this.ScriptTokenInstance.methods.writePaper(authors, amounts, paperSourceHash).send({from: this.accounts[0]});
    console.log(returnObj)
    let id = returnObj.events.PaperCreation.returnValues.paperId;
    let pdf = "s3.amazon/{id}.pdf";
    let image = "s3.amazon/{id}.png";

    fetch("http://localhost:8000/manuscripts", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title, abstract, pdf, image, authors, id})
    }).then(()=> {
      console.log("New Paper Added to database.")
    })
    alert("New Paper with keccak hash " + paperSourceHash + " is minted to Author " + this.state.authorAddresses + ". And the amount: " + this.state.tokenCirculation);
  }

  handleCheckBalance = async() => {
    let _userTokens = await this.ScriptTokenInstance.methods.balanceOf(this.accounts[0], this.state.targetTokenID).call();
    // const _asset = {
    //   tokenAddress: this.ScriptTokenInstance._address,
    //   tokenId: this.state.targetTokenID,
    //   schemaName: WyvernSchemaName.ERC1155,
    // }
    // let _userTokens2 = await this.exchange.getAssetBalance({accountAddress: this.accounts[0], asset:_asset})
    this.setState({userTokens: _userTokens});

    // this.exchange.getAssetBalance({accountAddress: this.accounts[0], asset:_asset}).then((value) => {this.setState({userTokens: value.toString()})});
  }

  handleListPaper = async() => {
    console.log("Checking if marketplace is approved operator.");
    console.log(this.ScriptusMarketInstance);
    const approved = await this.ScriptTokenInstance.methods.isApprovedForAll(this.accounts[0], this.ScriptusMarketInstance._address).call();
    console.log(approved);
    if (!approved) {
      alert("First time interacting with marketplace. Needs to set approval firstt. This transaction should only happen once. You will see a second transaction after this one.");
      await this.ScriptTokenInstance.methods.setApprovalForAll(this.ScriptusMarketInstance._address, true).send({from: this.accounts[0]});
    }
    console.log("MarketPlace is approved. Now Listing the item.");
    await this.ScriptusMarketInstance.methods.listItemPostedPrice(this.state.sellTokenID, this.state.sellTokenUnitPrice, this.state.sellTokenAmount).send({from: this.accounts[0]});
  }
  handleCalculateBuyPrice = async() => {
    const {0:_txValue, 1:_buyTotalPrice} = await this.ScriptusMarketInstance.methods.calculatePostedPricePurchasePayment(this.state.buyTokenID, this.state.buyTokenSeller, this.state.buyTokenAmount).call();
    this.setState({buyTotalPrice: _buyTotalPrice});
  }
  handleBuyPaper = async() => {
    console.log(this.accounts[0]);
    await this.ScriptusMarketInstance.methods.purchaseItemPostedPrice(this.state.buyTokenID, this.state.buyTokenSeller, this.state.buyTokenAmount).send({from: this.accounts[0], value: this.state.buyTotalPrice});
  }

  handleSend = async() => {
    await this.ScriptTokenInstance.methods.safeTransferFrom(this.accounts[0],
    this.state.recipientAddress, this.state.targetTokenIDsend,
    this.state.sendAmount, 0x0).send({from:this.accounts[0]});
    alert("Paper ID" + this.state.targetTokenIDsend+ " is transferred to " +
    this.state.recipientAddress+ " in the amount of " +
    this.state.sendAmount);
  }
  handleViewPaper = async() => {
    fetch("http://localhost:8000/manuscripts/"+this.state.viewTokenID)
      .then( res => {
        return res.json();
      })
      .then(data => {
        console.log(data);
        this.setViewingPaper(data);
      })
  };
  setViewingPaper = (data) => {
    this.setState({
      viewAbstract: data.abstract,
      viewTitle: data.title,
      viewAuthors: data.authors
    })

  }
 
  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Manuscript</h1>
        <p>A research sharing platform for the Web3 era.</p>
        {/* <h2>KYC example</h2> 
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleKycWhitelisting}> Add to whitelist</button> */}
        <h2>Mint Your Paper:</h2>
        <p>Title of your paper: <input type="text" name="paperSourceTitle" value={this.state.paperSourceTitle} onChange={this.handlePaperSourceTitleChange} /></p>

        <p>Input your paper: <input type="text" name="paperSourceCode" value={this.state.paperSourceCode} onChange={this.handleInputChange} /></p>

        <p>Input the amount: <input type="number" name="tokenCirculation" value={this.state.tokenCirculation} onChange={this.handleCirculationChange}/></p>

        <p>Input author (authors support coming in the future): <input type="text" name="authorAddresses" value={this.state.authorAddresses} onChange={this.handleAuthorsChange} /></p>

        <button type="button" onClick={this.handleMint}> Mint!</button> 

        <h2>Check Your Balances:</h2>
        Token ID: <input type="text" name="targetTokenID" value={this.state.targetTokenID} onChange={this.handleTokenIDChange} />
        <button type="button" onClick={this.handleCheckBalance}> Check Balance!</button> 
        <p>You own: {this.state.userTokens} tokens.</p>


        <h2>Send Your Tokens!</h2>
        Token ID: <input type="text" name="targetTokenIDsend" value={this.state.targetTokenIDsend} onChange={this.handleTokenIDSendChange} />
        Recipient Address: <input type="text" name="recipientAddress" value={this.state.recipientAddress} onChange={this.recipientAddressChange} />
        Amount: <input type="text" name="sendAmount" value={this.state.sendAmount} onChange={this.sendAmountChange} />
        <button type="button" onClick={this.handleSend}> Send</button> 


        <h2>View Paper!</h2>
        Token ID: <input type="text" name="viewTokenID" value={this.state.viewTokenID} onChange={this.handleViewTokenIDChange} />
        <button type="button" onClick={this.handleViewPaper}> View</button> 

        <p>Title: {this.state.viewTitle}</p>
        <p>Authors: {this.state.viewAuthors}</p>
        <p>Abstract: {this.state.viewAbstract}</p>

        <h2>List Your Paper For Sale!</h2>
        Token ID: <input type="text" name="sellTokenID" value={this.state.sellTokenID} onChange={this.handleSellTokenIDChange} />
        Amount: <input type="number" name="sellTokenAmount" value={this.state.sellTokenAmount} onChange={this.handleSellTokenAmountChange} />
        Unit Price: <input type="number" name="sellTokenUnitPrice" value={this.state.sellTokenUnitPrice} onChange={this.handleSellTokenPriceChange} />
        <button type="button" onClick={this.handleListPaper}> List!</button> 



        <h2>Purchase a Paper! Support a researcher!</h2>
        Token ID: <input type="text" name="buyTokenID" value={this.state.buyTokenID} onChange={this.handleBuyTokenIDChange} />
        Amount: <input type="number" name="buyTokenAmount" value={this.state.buyTokenAmount} onChange={this.handleBuyTokenAmountChange} />
        Seller: <input type="text" name="buyTokenSeller" value={this.state.buyTokenSeller} onChange={this.handleBuyTokenSellerChange} />

        <button type="button" onClick={this.handleCalculateBuyPrice}> Calculate</button> 
        <p>Total Price: {this.state.buyTotalPrice}</p>

        <button type="button" onClick={this.handleBuyPaper}> Buy!</button> 
      </div>
    );
  }
}

export default App;
