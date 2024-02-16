// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Apeiron is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable, IERC2981 {
    using Counters for Counters.Counter;
    uint256 maxSupply = 3333;

    bool public publicMintOpen = false;
    bool public whiteListMintOpen = false;
    
    mapping(address => bool) public whiteList;

    Counters.Counter private _tokenIdCounter;

    address private _royaltyReceiver;
    uint256 private _royaltyPercentage;

    event RoyaltiesSet(address indexed receiver, uint256 percentage);

    constructor(address royaltyReceiver, uint256 royaltyPercentage) ERC721("Apeiron", "APRN") {
        _royaltyReceiver = royaltyReceiver;
        _royaltyPercentage = royaltyPercentage;
        emit RoyaltiesSet(royaltyReceiver, royaltyPercentage);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function editMintWindow(bool _publicMintOpen, bool _whiteListMintOpen) external onlyOwner {
        publicMintOpen = _publicMintOpen;
        whiteListMintOpen = _whiteListMintOpen;
    }

    function setWhiteList(address[] calldata addresses) external onlyOwner{
        for(uint256 i = 0; i < addresses.length; i++){
            whiteList[addresses[i]] = true;
        }

    }

    function internalMint(string memory uri) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function whiteListMint(string memory uri) public payable {
        require(whiteListMintOpen, "White List Mint Not Open");
        require(whiteList[msg.sender], "Not on the white list!");
        require(msg.value == 0.001 ether, "Not enough money!");
        require(totalSupply() < maxSupply, "Sold out");
        internalMint(uri);
    }
    
    function publicMint(string memory uri) public payable {
        require(publicMintOpen, "Public Mint Not Open");
        require(msg.value == 0.001 ether, "Not enough money!");
        require(totalSupply() < maxSupply, "Sold out");
        internalMint(uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        royaltyAmount = (salePrice * _royaltyPercentage) / 100;
        receiver = _royaltyReceiver;
    }

    function setRoyalties(address newRoyaltyReceiver, uint256 newRoyaltyPercentage) external onlyOwner {
        require(newRoyaltyReceiver != address(0), "Invalid royalty receiver");
        require(newRoyaltyPercentage <= 100, "Invalid royalty percentage");
        _royaltyReceiver = newRoyaltyReceiver;
        _royaltyPercentage = newRoyaltyPercentage;
        emit RoyaltiesSet(newRoyaltyReceiver, newRoyaltyPercentage);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
