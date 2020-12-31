const Poster = artifacts.require("Poster");
//const PosterShop = artifacts.require("PosterShop");

contract("Poster", accounts => {
    it("should put 100 Poster ID 0 in the first account", () =>
        Poster.deployed()
            .then(instance => instance.balanceOf.call(accounts[0], 0))
            .then(balance => {
                assert.equal(
                    balance.toNumber(),
                    100,
                    "100 wasn't in the first account"
                );
            }));

    it("should send 10 Poster ID 0 correctly", () => {
        let poster;

        // Get initial balances of first and second account.
        const account_one = accounts[0];
        const account_two = accounts[1];

        let account_one_starting_balance;
        let account_two_starting_balance;
        let account_one_ending_balance;
        let account_two_ending_balance;

        const amount = 10;

        return Poster.deployed()
            .then(instance => {
                poster = instance;
                return poster.balanceOf.call(account_one, 0);
            })
            .then(balance => {
                account_one_starting_balance = balance.toNumber();
                return poster.balanceOf.call(account_two, 0);
            })
            .then(balance => {
                account_two_starting_balance = balance.toNumber();
                return poster.safeTransferFrom(account_one, account_two, 0, amount, "0x0");
            })
            .then(() => poster.balanceOf.call(account_one, 0))
            .then(balance => {
                account_one_ending_balance = balance.toNumber();
                return poster.balanceOf.call(account_two, 0);
            })
            .then(balance => {
                account_two_ending_balance = balance.toNumber();

                assert.equal(
                    account_one_ending_balance,
                    account_one_starting_balance - amount,
                    "Amount wasn't correctly taken from the sender"
                );
                assert.equal(
                    account_two_ending_balance,
                    account_two_starting_balance + amount,
                    "Amount wasn't correctly sent to the receiver"
                );
            });
    });

    it("should burn 10 Poster ID 0 correctly", () => {
        let poster;

        // Get initial balance
        const account_one = accounts[0];

        let account_one_starting_balance;
        let account_one_ending_balance;

        const amount = 10;

        return Poster.deployed()
            .then(instance => {
                poster = instance;
                return poster.balanceOf.call(account_one, 0);
            })
            .then(balance => {
                account_one_starting_balance = balance.toNumber();
                return poster.burn(account_one, 0, amount)
            })
            .then(() => poster.balanceOf.call(account_one, 0))
            .then(balance => {
                account_one_ending_balance = balance.toNumber();

                assert.equal(
                    account_one_ending_balance,
                    account_one_starting_balance - amount,
                    "Amount wasn't correctly burnt"
                );
            });
    });

})
