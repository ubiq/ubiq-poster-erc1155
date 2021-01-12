const { expectRevert } = require('@openzeppelin/test-helpers');

const Poster = artifacts.require("Poster");
const PosterShop = artifacts.require("PosterShop");

let user0;
let user1;
let user2;
let user3;
let posterContract;
let posterShopContract;

contract("Poster and PosterShop", accounts => {
    before(async () => {
        user0 = accounts[0];
        user1 = accounts[1];
        user2 = accounts[2];
        user3 = accounts[3];
        rate = 5000000000000000000n
        posterContract = await Poster.new();
        posterShopContract = await PosterShop.new(rate, user0, posterContract.address, 0, user0);
    });

    it("should put 100 Poster ID 0 in the first account", async () => {
        let balance = await posterContract.balanceOf.call(user0, 0)

        assert.equal(
            balance.toNumber(),
            100,
            "100 wasn't in the first account"
        );
    });

    it("should send 10 Poster ID 0 correctly", async () => {
        const amount = 10;

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_start_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user1, 0)
        let user1_start_balance = balance.toNumber();

        await posterContract.safeTransferFrom(user0, user1, 0, amount, "0x0")

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_end_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user1, 0)
        let user1_end_balance = balance.toNumber();

        assert.equal(
            user0_end_balance,
            user0_start_balance - amount,
            "Amount wasn't correctly taken from the sender"
        );
        assert.equal(
            user1_end_balance,
            user1_start_balance + amount,
            "Amount wasn't correctly sent to the receiver"
        );
    });

    it("should burn 10 Poster ID 0 correctly", async () => {
        const amount = 10;

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_start_balance = balance.toNumber();

        await posterContract.burn(user0, 0, amount)

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_end_balance = balance.toNumber();

        assert.equal(
            user0_end_balance,
            user0_start_balance - amount,
            "Amount wasn't correctly burnt"
        );
    });

    it('has the correct Poster Shop Rate', async () => {
        let rate = await posterShopContract.rate()

        assert.equal(
            rate.toString(),
            "5000000000000000000",
            "Poster Shop rate is not right"
        );
    });

    it('fails on 0 Wei Poster Shop purchase', async () => {
        await expectRevert(posterShopContract.buyTokens(user2, { from: user2 }), 'NFT sale: weiAmount is 0');
    });

    it('fails on No Approval Poster Shop purchase', async () => {
        await expectRevert(posterShopContract.buyTokens(user2, { from: user2, value: 5000000000000000000 }), 'ERC1155: caller is not owner nor approved');
    });

    it('purchases 1 Poster ID 0 when Poster Shop contract is Approved', async () => {
        const amount = 1;
        await posterContract.setApprovalForAll(posterShopContract.address, true)

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_start_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_start_balance = balance.toNumber();

        await posterShopContract.buyTokens(user2, { from: user2, value: 5000000000000000000 })

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_end_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_end_balance = balance.toNumber();

        assert.equal(
            user0_end_balance,
            user0_start_balance - amount,
            "Amount wasn't correctly taken from the sender"
        );
        assert.equal(
            user2_end_balance,
            user2_start_balance + amount,
            "Amount wasn't correctly sent to the receiver"
        );
    });

    it('purchases 2 Poster ID 0 when sending correct amount', async () => {
        const amount = 2;

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_start_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_start_balance = balance.toNumber();

        await posterShopContract.buyTokens(user2, { from: user2, value: 10000000000000000000 })

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_end_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_end_balance = balance.toNumber();

        assert.equal(
            user0_end_balance,
            user0_start_balance - amount,
            "Amount wasn't correctly taken from the sender"
        );
        assert.equal(
            user2_end_balance,
            user2_start_balance + amount,
            "Amount wasn't correctly sent to the receiver"
        );
    });

    it('purchases 1 Poster ID 0 when using fallback function and extra funds sent', async () => {
        const amount = 1;

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_start_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_start_balance = balance.toNumber();

        await posterShopContract.sendTransaction({ from: user2, value: 5100000000000000000 })

        balance = await posterContract.balanceOf.call(user0, 0)
        let user0_end_balance = balance.toNumber();
        balance = await posterContract.balanceOf.call(user2, 0)
        let user2_end_balance = balance.toNumber();

        assert.equal(
            user0_end_balance,
            user0_start_balance - amount,
            "Amount wasn't correctly taken from the sender"
        );
        assert.equal(
            user2_end_balance,
            user2_start_balance + amount,
            "Amount wasn't correctly sent to the receiver"
        );
    });

    it('fails when purchase Value < rate. e.g. 4.9 UBQ', async () => {
        await expectRevert(posterShopContract.buyTokens(user3, { from: user3, value: 4900000000000000000 }), 'NFT sale: weiAmount is < rate');
    });

    it('should update the Rate to 5.1 UBQ correctly', async () => {
        await posterShopContract.setRate(5100000000000000000n)

        let rate = await posterShopContract.rate()

        assert.equal(
            rate.toString(),
            "5100000000000000000",
            "Poster Shop rate is not right"
        );
    });

    it('should update the ERC1155Holder address (and set back to original) correctly', async () => {
        await posterShopContract.setERC1155Holder(user1)

        erc1155Holder = await posterShopContract.erc1155Holder()

        assert.equal(
            erc1155Holder.toString(),
            user1,
            "Poster Shop holder not updated right"
        );

        await posterShopContract.setERC1155Holder(user0)

        erc1155Holder = await posterShopContract.erc1155Holder()

        assert.equal(
            erc1155Holder.toString(),
            user0,
            "Poster Shop holder not updated right"
        );
    });
})
