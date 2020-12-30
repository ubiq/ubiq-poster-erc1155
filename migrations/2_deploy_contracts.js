const Poster = artifacts.require("./Poster.sol");
const PosterShop = artifacts.require("./PosterShop.sol");

module.exports = function (deployer, network, accounts) {
    // 100 UBQ default
    rate = 100000000000000000000n
    if (network == "develop") {
        // 5 UBQ = 5000000000000000000 Wei
        rate = 5000000000000000000n
    };

    deployer.deploy(Poster);
    deployer.deploy(PosterShop, rate, accounts[0], Poster.address, 0, accounts[0])
};
