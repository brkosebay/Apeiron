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

contract Apeiron is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable,
    IERC2981
{
    using Counters for Counters.Counter;
    uint256 maxSupply = 3333;

    bool public publicMintOpen = false;
    bool public whiteListMintOpen = false;

    string private _baseUri = "ipfs://";

    mapping(address => bool) public whiteList;

    Counters.Counter private _tokenIdCounter;

    address private _mintReceiver1;
    address private _mintReceiver2;

    address private _royaltyReceiver1;
    uint256 private _royaltyPercentage1;
    address private _royaltyReceiver2;
    uint256 private _royaltyPercentage2;

    event RoyaltiesSet(address indexed receiver, uint256 percentage);

    constructor(
        address mintReceiver1,
        address mintReceiver2,
        address royaltyReceiver1,
        uint256 royaltyPercentage1,
        address royaltyReceiver2,
        uint256 royaltyPercentage2
    ) ERC721("Apeiron", "APRN") {
        _mintReceiver1 = mintReceiver1;
        _mintReceiver2 = mintReceiver2;
        _royaltyReceiver1 = royaltyReceiver1;
        _royaltyPercentage1 = royaltyPercentage1;
        _royaltyReceiver2 = royaltyReceiver2;
        _royaltyPercentage2 = royaltyPercentage2;
        emit RoyaltiesSet(_royaltyReceiver1, _royaltyPercentage1);
        emit RoyaltiesSet(_royaltyReceiver2, _royaltyPercentage2);
    }

    function setBaseURI(string memory newUri) external onlyOwner {
    _baseUri = newUri;
    }

    function _baseURI() internal view override returns (string memory) {
    return _baseUri;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function editMintWindow(
        bool _publicMintOpen,
        bool _whiteListMintOpen
    ) external onlyOwner {
        publicMintOpen = _publicMintOpen;
        whiteListMintOpen = _whiteListMintOpen;
    }

    function setWhiteList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
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
        uint256 splitValue = msg.value / 2;
        payable(_mintReceiver1).transfer(splitValue);
        payable(_mintReceiver2).transfer(msg.value - splitValue);
    }

    function publicMint(string memory uri) public payable {
        require(publicMintOpen, "Public Mint Not Open");
        require(msg.value == 0.001 ether, "Not enough money!");
        require(totalSupply() < maxSupply, "Sold out");
        internalMint(uri);
        uint256 splitValue = msg.value / 2;
        payable(_mintReceiver1).transfer(splitValue);
        payable(_mintReceiver2).transfer(msg.value - splitValue);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function royaltyInfo(
        uint256,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        uint256 royaltyAmount1 = (salePrice * _royaltyPercentage1) / 100;
        uint256 royaltyAmount2 = (salePrice * _royaltyPercentage2) / 100;
        royaltyAmount = royaltyAmount1 + royaltyAmount2;
        receiver = address(this);
    }

    function getRoyaltyReceivers()
        external
        view
        returns (address[] memory receivers)
    {
        receivers = new address[](2);
        receivers[0] = _royaltyReceiver1;
        receivers[1] = _royaltyReceiver2;
    }

    function setRoyalties(
        address newRoyaltyReceiver1,
        uint256 newRoyaltyPercentage1,
        address newRoyaltyReceiver2,
        uint256 newRoyaltyPercentage2
    ) external onlyOwner {
        require(
            newRoyaltyReceiver1 != address(0) &&
                newRoyaltyReceiver2 != address(0),
            "Invalid royalty receiver"
        );
        require(
            newRoyaltyPercentage1 + newRoyaltyPercentage2 <= 100,
            "Invalid royalty percentage"
        );
        _royaltyReceiver1 = newRoyaltyReceiver1;
        _royaltyPercentage1 = newRoyaltyPercentage1;
        _royaltyReceiver2 = newRoyaltyReceiver2;
        _royaltyPercentage2 = newRoyaltyPercentage2;
        emit RoyaltiesSet(newRoyaltyReceiver1, newRoyaltyPercentage1);
        emit RoyaltiesSet(newRoyaltyReceiver2, newRoyaltyPercentage2);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
