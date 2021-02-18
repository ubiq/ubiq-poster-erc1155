const Poster = artifacts.require("./Poster.sol");
const PosterShop = artifacts.require("./PosterShop.sol");

module.exports = function (deployer, network, accounts) {
    // 88 UBQ default
    rate = 88000000000000000000n
    if (network == "develop") {
        // 5 UBQ = 5000000000000000000 Wei
        rate = 5000000000000000000n
    };

    deployer.then(async () => {
        await deployer.deploy(Poster)
        await deployer.deploy(PosterShop, rate, accounts[0], Poster.address, 0, accounts[0])
    });
};
