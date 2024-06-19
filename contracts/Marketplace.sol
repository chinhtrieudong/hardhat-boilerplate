//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct ListingItem {
        uint256 tokenId;
        address tokenAddress;
        address payable seller;
        uint256 price;
        bool isSold;
    }

    Counters.Counter private _listingIds;

    mapping(uint256 => ListingItem) public listingItems;

    function getListingItems() public view returns (ListingItem[] memory) {
        ListingItem[] memory items = new ListingItem[](_listingIds.current());
        for (uint256 i = 0; i < _listingIds.current(); i++) {
            items[i] = listingItems[i];
        }
        return items;
    }

    function listItem(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);
        listingItems[_listingIds.current()] = ListingItem(
            tokenId,
            tokenAddress,
            payable(msg.sender),
            price,
            false
        );
        _listingIds.increment();
        console.log("Listing item with id %s", _listingIds.current());
    }

    function buyItem(uint256 listingId) public payable {
        ListingItem storage item = listingItems[listingId];
        require(item.isSold == false, "Item is already sold");
        require(item.price == msg.value, "Price is not correct");
        IERC721(item.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.isSold = true;
        item.seller.transfer(msg.value);
    }

    function cancelListing(uint256 listingId) public {
        ListingItem storage item = listingItems[listingId];
        require(item.isSold == false, "Item is already sold");
        require(item.seller == msg.sender, "Only seller can cancel listing");
        IERC721(item.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        delete listingItems[listingId];
    }
}
