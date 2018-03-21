pragma solidity ^0.4.2;

import "./DAuction.sol";

contract DDutchAuction is DAuction {

    uint256 offerPriceDecrement;
    uint256 startPrice;

    function DDutchAuction(uint256 _reservePrice, address _judgeAddress, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) DAuction(_reservePrice, _numBlocksAuctionOpen, _judgeAddress) public {
        offerPriceDecrement = _offerPriceDecrement;
        startPrice = _reservePrice + _numBlocksAuctionOpen * _offerPriceDecrement;
    }

    function bid() public biddingOpen validPrice payable returns(address) {
        isSold = true;
        SoldTo(tx.origin);
        if (judgeAddress == 0) {
            owner.transfer(msg.value);
            SendFund(owner, msg.value);
        }
        soldPrice = msg.value;
        highestBidder = tx.origin;
        return tx.origin;
    }

    modifier validPrice {
        require(msg.value >= startPrice - (block.number - startBlock) * offerPriceDecrement);
        _;
    }

    //TODO: place your code here
}
