const Poster = artifacts.require("./Poster.sol");
module.exports = function(deployer) {
    deployer.deploy(Poster);
};

const PosterShop = artifacts.require("./PosterShop.sol");
module.exports = function(deployer) {
    deployer.deploy(PosterShop);
};
