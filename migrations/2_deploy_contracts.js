const Poster = artifacts.require("./Poster.sol");
const PosterShop = artifacts.require("./PosterShop.sol");

module.exports = function(deployer) {
    deployer.deploy(Poster);
    deployer.deploy(PosterShop);
};
