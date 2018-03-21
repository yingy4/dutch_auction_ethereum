pragma solidity ^0.4.2;
contract DAuction {

    uint256 reservePrice;
    uint256 numBlocksAuctionOpen;
    address judgeAddress;
    address owner;
    uint startBlock;
    bool isSold;
    address highestBidder;
    uint256 soldPrice;
    bool finalJudge;

    event Judge(address add);
    event Owner(address add);
    event Sender(address add, uint256 value);

    event SendFund(address to, uint256 value);
    event SoldTo(address highestBidder);

    // constructor
    function DAuction(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, address _judgeAddress) public {
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        judgeAddress = _judgeAddress;
        isSold = false;
        owner = tx.origin;
        startBlock = block.number;
        finalJudge = false;
        Owner(owner);
        Judge(judgeAddress);
    }

    function bid() public biddingOpen payable returns(address highestBidder) {

    }

    function finalize() auctionOver judgeOrWinner judgeNotEmpty notFinalJudge public {
        owner.transfer(soldPrice);
        SendFund(owner, soldPrice);
        finalJudge = true;
    }

    // Part 2
    function refund(uint256 refundAmount) public auctionOver judgeNotEmpty judgeOnly notFinalJudge {
        highestBidder.transfer(refundAmount);
        SendFund(highestBidder, refundAmount);
        finalJudge = true;
    }

    modifier biddingOpen {
      require(block.number <= (startBlock + numBlocksAuctionOpen) && !isSold);
      _;
    }

    modifier auctionOver {
      require(isSold);
      _;
    }

    modifier judgeOnly {
      require(tx.origin == judgeAddress);
      _;
    }

    modifier judgeNotEmpty {
        require(judgeAddress != 0);
        _;
    }

    modifier notFinalJudge {
        require(!finalJudge);
        _;
    }

    modifier notOwner {
        require(tx.origin != owner);
        _;
    }

    modifier judgeOrWinner {
        require((tx.origin == judgeAddress) || (tx.origin == highestBidder));
        _;
    }

    //TODO: place your code here
}
