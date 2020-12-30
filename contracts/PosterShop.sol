// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PosterShop is ERC1155Holder, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */
    // The token and ID being sold
    IERC1155 public token;
    uint256 public tokenID;
    // Address where funds are collected
    address payable public wallet;
    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a ERC20Detailed token with 3 decimals called TOK
    // 1 wei will give you 1 unit, or 0.001 TOK.
    uint256 public rate;
    // Poster NFT holder address
    address public erc1155Holder;

    /* ========== CONSTRUCTOR ========== */
    /**
     * @param _rate Number of token units a buyer gets per wei
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
     * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     */
    constructor(
        uint256 _rate,
        address payable _wallet,
        IERC1155 _token,
        uint256 _tokenID,
        address _erc1155Holder
    ) public {
        require(_rate > 0, "NFT sale: rate is 0");
        require(_wallet != address(0), "NFT sale: wallet is the zero address");
        require(
            address(_token) != address(0),
            "NFT sale: token is the zero address"
        );

        rate = _rate;
        wallet = _wallet;
        token = _token;
        tokenID = _tokenID;
        erc1155Holder = _erc1155Holder;
    }

    /* ========== VIEWS ========== */

    /* ========== MUTATIVE FUNCTIONS ========== */
    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) public payable nonReentrant {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(msg.sender, beneficiary, weiAmount, tokens);

        _forwardFunds();
    }

    /**
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
    {
        require(
            beneficiary != address(0),
            "NFT sale: beneficiary is the zero address"
        );
        require(weiAmount != 0, "NFT sale: weiAmount is 0");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed.
     * @param beneficiary Address receiving the tokens
     * @param tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount)
        internal
    {
        IERC1155(token).safeTransferFrom(
            erc1155Holder,
            beneficiary,
            tokenID,
            tokenAmount,
            "0x0"
        );
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount)
        internal
        view
        returns (uint256)
    {
        return weiAmount.div(rate);
    }

    /**
     * @dev Determines how UBQ is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        wallet.transfer(msg.value);
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     */
    fallback() external payable {
        buyTokens(_msgSender());
    }

    receive() external payable {
        buyTokens(_msgSender());
    }

    /* ========== RESTRICTED FUNCTIONS ========== */
    function setRate(uint256 _rate) external onlyOwner {
        require(_rate > 0, "NFT sale: rate is 0");
        rate = _rate;
        emit RateUpdated(rate);
    }

    function setWallet(address payable _wallet) external onlyOwner {
        require(_wallet != address(0), "NFT sale: wallet is the zero address");
        wallet = _wallet;
        emit WalletUpdated(wallet);
    }

    function setToken(IERC1155 _token) external onlyOwner {
        require(
            address(_token) != address(0),
            "NFT sale: token is the zero address"
        );
        token = _token;
        emit TokenUpdated(token);
    }

    function setTokenID(uint256 _tokenID) external onlyOwner {
        tokenID = _tokenID;
        emit TokenIDUpdated(tokenID);
    }

    /* ========== EVENTS ========== */
    event RateUpdated(uint256 newRate);
    event WalletUpdated(address wallet);
    event TokenUpdated(IERC1155 token);
    event TokenIDUpdated(uint256 tokenID);
    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );
}
