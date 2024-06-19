pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MonoNFT is ERC721URIStorage, ERC721Enumerable {
    using Counters for Counters.Counter;

    address public marketplaceAddress;
    Counters.Counter private _tokenIds;

    constructor(address _marketplaceAddress) ERC721("MonoNFT", "MONO") {
        marketplaceAddress = _marketplaceAddress;
    }

    function giveAway(address to) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();

        string
            memory mockTokenURI = "https://famousfoxes.com/metadata/7779.json";

        _safeMint(to, newItemId);
        _setTokenURI(newItemId, mockTokenURI);

        setApprovalForAll(marketplaceAddress, true);
        _tokenIds.increment();
        console.log("Minted token %s to %s", newItemId, to);
        return newItemId;
    }

    // Override required by Solidity
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Override required by Solidity
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Required override to make Solidity happy when inheriting from multiple parents
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    // Required override to make Solidity happy when inheriting from multiple parents
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
