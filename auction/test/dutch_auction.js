//var Web3 = require('web3');
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var BigNumber = require('bignumber.js');
var run = require('./framework.js');

// Tests

contract('Dutch Auction', function (accounts) {
  it("creates a dutch auction", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [],
    });
  });

  it("rejects a low bid", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid", account: 1, payment: 450, succeed: false, on_error: "Low bid accepted" },
      ],
    });
  });

  it("accepts good bid", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid", account: 1, payment: 725, succeed: true, on_error: "Valid bid rejected" },
      ],
    });
  });

  it("changes balance correctly", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[1]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[1]);
      var diff = initial_balance.minus(final_balance);
      console.log("diff:"+diff);
      if (diff.lt(payment)) {
        return "Account debited too little for bid";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: get_initial_balance },
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: check_final_balance },
      ],
    });
  });

  it("rejects second bid", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid", account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "bid", account: 2, payment: 750, succeed: false, on_error: "Second bid accepted" },
      ],
    });
  });

  it("rejects early finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize",                           succeed: false, on_error: "Early finalize accepted" },
      ],
    });
  });

  // TODO: Add tests here
  it("rejects the bid after time period", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 11, action: "bid", account: 1, payment: 725, succeed: false, on_error: "After time period bid accepted" },
      ],
    });
  });

  it("accept the bid in time period", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 10, action: "bid", account: 1, payment: 725, succeed: true, on_error: "In time period bid rejected" },
      ],
    });
  });
/*
  it("changes balance correctly2", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance2;
    // A callback action that will get the initial balance for account 0.
    function get_initial_balance(accounts) {
      initial_balance2 = web3.eth.getBalance(accounts[2]);
      console.log("initial_balance2:"+initial_balance2);
    }
    // A callback action that will check the final balance for account 0 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance2 = web3.eth.getBalance(accounts[2]);
      console.log("final_balance2:"+final_balance2);
      var diff2 = initial_balance2.minus(final_balance2);
      console.log("diff2:"+diff2);
      if (!diff2.equals(0)) {
        return "Account debited not right for bid";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: get_initial_balance },
        { block: 2, action: "bid", account: 2, payment: payment, succeed: false, on_error: "Second bid accepted" },
        { block: 3, action: check_final_balance },
      ],
    });
  });
*/
  it("allow judge finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 9,               succeed: true,  on_error: "Judge finalize rejected" },
      ],
    });
  });

  it("allow winner finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 1,               succeed: true,  on_error: "Winner finalize rejected" },
      ],
    });
  });

  it("reject non judge finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 8,               succeed: false, on_error: "Non Judge finalize accepted" },
      ],
    });
  });

  it("only one can finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 1,               succeed: true,  on_error: "Winner finalize rejected" },
        { block: 3, action: "finalize", account: 9,               succeed: false,  on_error: "more than one finalize" },
        { block: 4, action: "finalize", account: 1,               succeed: false,  on_error: "more than one finalize" },
      ],
    });
  });

  it("allow judge refund", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "refund",   account: 9, amount: 725,  succeed: true,  on_error: "Judge refund rejected" },
      ],
    });
  });

  it("reject winner refund", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "refund",   account: 1, amount: 725,  succeed: false,  on_error: "Winner refund accepted" },
      ],
    });
  });

  it("reject refund after finalize", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 1,               succeed: true,  on_error: "Winner finalize rejected" },
        { block: 3, action: "refund",   account: 9, amount: 725,  succeed: false,  on_error: "Judge refund accepted after finalize" },
      ],
    });
  });

  it("reject finalize after refund", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "refund",   account: 9, amount: 725,  succeed: true,  on_error: "Judge refund rejected" },
        { block: 3, action: "finalize", account: 1,               succeed: false,  on_error: "Winner finalize accepted after refund" },
      ],
    });
  });

  it("reject double refund", function (done) {
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        500,
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid",      account: 1, payment: 725, succeed: true,  on_error: "Valid bid rejected" },
        { block: 2, action: "refund",   account: 9, amount: 725,  succeed: true,  on_error: "First refund rejected" },
        { block: 3, action: "refund",   account: 9, amount: 725,  succeed: false,  on_error: "Second refund accepted" },
      ],
    });
  });

  it("add balance to seller correctly without judge", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[0]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[0]);
      var diff = final_balance.minus(initial_balance);
      console.log("diff:"+diff);
      if (!diff.equals(payment)) {
        return "seller didn't receive correct amount";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        0,
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: get_initial_balance },
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: check_final_balance },
      ],
    });
  });

  it("hold balance to seller correctly with judge", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[0]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[0]);
      var diff = final_balance.minus(initial_balance);
      console.log("diff:"+diff);
      if (!diff.equals(0)) {
        return "hold wrong";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: get_initial_balance },
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: check_final_balance },
      ],
    });
  });

  it("release balance to seller correctly with judge after finalize by winner", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[0]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[0]);
      var diff = final_balance.minus(initial_balance);
      console.log("diff:"+diff);
      if (!diff.equals(payment)) {
        return "Did not release payment";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: get_initial_balance },
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 1,              succeed: true, on_error: "Valid finalize rejected" },
        { block: 3, action: check_final_balance },
      ],
    });
  });

  it("release balance to seller correctly with judge after finalize by judge", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[0]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[0]);
      var diff = final_balance.minus(initial_balance);
      console.log("diff:"+diff);
      if (!diff.equals(payment)) {
        return "Did not release payment";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: get_initial_balance },
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: "finalize", account: 9,              succeed: true, on_error: "Valid finalize rejected" },
        { block: 3, action: check_final_balance },
      ],
    });
  });

  it("refund balance to winner correctly with judge after refund by judge", function (done) {
    var payment = new BigNumber("2000000000000000");
    // The initial balance of the account.
    var initial_balance;
    // A callback action that will get the initial balance for account 1.
    function get_initial_balance(accounts) {
      initial_balance = web3.eth.getBalance(accounts[1]);
    }
    // A callback action that will check the final balance for account 1 and return any error messages.
    function check_final_balance(accounts) {
      var final_balance = web3.eth.getBalance(accounts[1]);
      var diff = final_balance.minus(initial_balance);
      console.log("diff:"+diff);
      if (!diff.equals(payment)) {
        return "Did not refund payment";
      }
    }
    // Run the test.
    run(accounts, done, {
      type:                "dutch",
      reservePrice:        payment.dividedBy(2),
      judgeAddress:        accounts[9],
      biddingTimePeriod:   10,
      offerPriceDecrement: 25,
      actions: [
        { block: 1, action: "bid", account: 1, payment: payment, succeed: true, on_error: "Valid bid rejected" },
        { block: 2, action: get_initial_balance },
        { block: 2, action: "refund", account: 9, amount: payment, succeed: true, on_error: "Valid refund rejected" },
        { block: 3, action: check_final_balance },
      ],
    });
  });

});
