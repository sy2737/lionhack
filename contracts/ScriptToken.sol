pragma solidity >= 0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
// import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "hardhat/console.sol";

contract ScriptToken is ERC1155Supply, ERC2771Context, EIP712 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

	// Optional mapping for paper source code hashes 
    mapping(uint256 => string) private _paperHashes;
    mapping(uint256 => address) private _minters;
    mapping(uint256 => address) private _uris;

    event PaperCreation(uint256 indexed paperId, address indexed author, uint256 amount);
    constructor(string memory uri, address trustedForwarder) 
    ERC1155("") 
    ERC2771Context(trustedForwarder) {
    }

    function uri(uint256 tokenId) public view returns (string memory){
        return _uris[tokenId];
    }
	function _setPaperHash(uint256 paperId, string memory sourceHash) internal {
		require(exists(paperId), "Paper: paperHash set of nonexistent paperId");
		_paperHashes[paperId] = sourceHash;
	}

    function writePaper(address[] memory authors, uint256[] memory amounts, string memory sourceHash)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        for (uint256 i = 0; i < authors.length; i++) {
            _mint(authors[i], newItemId, amounts[i], "");
            emit PaperCreation(newItemId, authors[i], amounts[i]);
        }
        _setPaperHash(newItemId, sourceHash);

        return newItemId;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Functions related to gas-less transactions.
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) { 
        return ERC2771Context._msgSender(); 
    }
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) { 
        return ERC2771Context._msgData(); 
    } 


    function setApprovalForAll(address operator, bool approved) public virtual override {
        _setApprovalForAll(_msgSender(), operator, approved);
    }



    // everything below is for the permit function
    using Counters for Counters.Counter;

    mapping(address => Counters.Counter) private _nonces;

    // solhint-disable-next-line var-name-mixedcase
    bytes32 private immutable _PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,bool value,uint256 nonce,uint256 deadline)");

    /**
     * @dev See {IERC20Permit-permit}.
     */
    function permit(
        address owner,
        address spender,
        bool value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(block.timestamp <= deadline, "ScriptusToken Permit: expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(
                _PERMIT_TYPEHASH, owner, spender, value, _useNonce(owner), deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == owner, "ScriptusToken Permit: invalid signature");

        _setApprovalForAll(owner, spender, value);
    }

    /**
     * @dev See {IERC20Permit-nonces}.
     */
    function nonces(address owner) public view returns (uint256) {
        return _nonces[owner].current();
    }

    /**
     * @dev See {IERC20Permit-DOMAIN_SEPARATOR}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev "Consume a nonce": return the current value and increment.
     *
     * _Available since v4.1._
     */
    function _useNonce(address owner) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }

}