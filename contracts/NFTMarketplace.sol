//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    uint256 public listingPrice;

    constructor(uint256 _listingPrice) {
        listingPrice = _listingPrice;
    }

    struct Item {
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool isSold;
    }

    Item[] public items;
    Counters.Counter private _itemIds;

    function listNft(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    ) public payable nonReentrant returns (uint256) {
        require(_price > 0, "must be at least 1 wei");
        require(msg.value == listingPrice, "must equal to listing price");
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _tokenId);
        items.push(
            Item(_nftAddress, _tokenId, _price, payable(msg.sender), false)
        );

        return itemId;
    }

    function delistNft(uint256 _itemId) public {
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only seller can delist item");
        require(!item.isSold, "Item is already sold");
        IERC721(item.nftContract).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        delete items[_itemId];
    }

    function changeNftPrice(uint256 _itemId, uint256 _price) public {
        Item storage item = items[_itemId];
        require(item.seller == msg.sender, "Only seller can change price");
        require(!item.isSold, "Item is already sold");
        // IERC721(item.nftContract).transferFrom(
        //     address(this),
        //     msg.sender,
        //     item.tokenId
        // );
        // delete items[itemId];
        item.price = _price;
    }

    function nftPrice(uint256 _itemId) public view returns (uint256) {
        return items[_itemId].price;
    }

    function buyNft(uint256 _itemId) public payable nonReentrant {
        Item storage item = items[_itemId];
        require(item.price == msg.value, "Price is not correct");
        require(item.isSold == false, "Item is already sold");
        IERC721(item.nftContract).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.seller.transfer(msg.value);
        item.isSold = true;
    }

    function isSold(uint256 _itemId) public view returns (bool) {
        return items[_itemId].isSold;
    }
}
