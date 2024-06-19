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

    event ListingItemCreated(
        uint256 indexed id,
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address seller,
        uint256 price
    );

    uint256 public listingPrice;

    constructor(uint256 _listingPrice) {
        listingPrice = _listingPrice;
    }

    Counters.Counter private _listingIds;
    Counters.Counter private _itemsSold;

    mapping(uint256 => ListingItem) public listingItems;

    function getListingItems(
        uint256 offset,
        uint256 limit
    ) public view returns (ListingItem[] memory) {
        require(offset >= 0, "offset must be greater than 0");
        require(limit > 0, "limit must be greater than 0");

        uint256 resultLength = (offset + limit) > _listingIds.current()
            ? (_listingIds.current() - offset)
            : limit;

        if (resultLength <= 0) {
            return new ListingItem[](0);
        }
        ListingItem[] memory items = new ListingItem[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            items[i] = listingItems[i + offset];
        }

        return items;
    }

    function getUnsoldItems(
        uint256 offset,
        uint256 limit
    ) public view returns (ListingItem[] memory, uint256[] memory) {
        require(offset >= 0, "offset must be greater than 0");
        require(limit > 0, "limit must be greater than 0");

        ListingItem[] memory items = new ListingItem[](limit);
        uint256[] memory ids = new uint256[](limit);

        // at the offset, get limit items that are not sold
        uint256 i = 0;
        uint256 j = 0;
        uint256 length = _listingIds.current();

        while (i + offset < length && j < limit) {
            ListingItem memory item = listingItems[i + offset];
            if (!item.isSold) {
                items[j] = item;
                ids[j] = i + offset;
                j++;
            }
            i++;
        }

        return (items, ids);
    }

    function getTotalUnsoldItems() public view returns (uint256) {
        return _listingIds.current() - _itemsSold.current();
    }

    function getTotalItems() public view returns (uint256) {
        return _listingIds.current();
    }

    function getItemPrice(uint256 listingId) public view returns (uint256) {
        return listingItems[listingId].price;
    }

    function totalListingItems() public view returns (uint256) {
        return _listingIds.current();
    }

    function listItem(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);

        uint256 currentId = _listingIds.current();
        listingItems[currentId] = ListingItem(
            tokenId,
            tokenAddress,
            payable(msg.sender),
            price,
            false
        );
        console.log("Listing item with id %s", currentId);

        emit ListingItemCreated(
            currentId,
            tokenId,
            tokenAddress,
            msg.sender,
            price
        );
        _listingIds.increment();

        return currentId;
    }

    function buyItem(uint256 listingId) public payable nonReentrant {
        ListingItem storage item = listingItems[listingId];
        require(item.isSold == false, "Item is already sold");
        require(item.price == msg.value, "Price is not correct");
        item.seller.transfer(msg.value);
        IERC721(item.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );
        item.isSold = true;
        _itemsSold.increment();
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
