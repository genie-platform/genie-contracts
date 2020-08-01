
pragma solidity ^0.6.0;

//import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Funding.sol";
import "./FundingOracleClient.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Counters.sol";

contract FundingFactory is Initializable,ERC721UpgradeSafe {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event FundingCreated( 
        address indexed funding,
        address owner,
        address operator,
        address interestToken
    );

    address public link;

    function initialize(address _link) public initializer {
        link = _link;
    }

    function createFunding(
        address _cToken,
        address _operator,
        address _oracle,
        bytes32 _jobId,
        uint8 _level,
        uint256 _ticketPrice,
        address _trustedForwarder
    ) public returns (address fundingAddress) {
        FundingOracleClient oracle = new FundingOracleClient(
            _oracle,
            _jobId,
            _level,
            link
        );
        Funding funding = new Funding(
            msg.sender,
            _cToken,
            _operator,
            address(oracle),
            _ticketPrice
          
        );
        funding.transferOwnership(msg.sender);

        fundingAddress = address(funding);
        oracle.transferOwnership(fundingAddress);
        emit FundingCreated(fundingAddress, msg.sender, _operator, _cToken);
    }

    function createFundingWithNft(
        address _nftToken,
        address _operator,
        address _oracle,
        bytes32 _jobId,
        uint8 _level,
        uint256 _ticketPrice,
        string memory _name,
        string memory _sym,
        string memory _baseURI
    ) public returns(address fundingAddress){
       __ERC721_init(_name, _sym);
        _tokenIds.increment();
       // uint256 newItemId = _tokenIds.current();//will be done in Funding.sol
        _setBaseURI(_baseURI); //;(newItemId, tokenURI);//used setBaseURI since tokens will share almost the same metadata url
        // _mint(winner, newItemId);//will be done uin Funding .sol
        FundingOracleClient oracle = new FundingOracleClient(
            _oracle,
            _jobId,
            _level,
            link
        );
        Funding funding = new Funding(
            msg.sender,
            _nftToken,
            _operator,
            address(oracle),
            _ticketPrice
        );
        funding.transferOwnership(msg.sender);
        fundingAddress = address(funding);
        oracle.transferOwnership(fundingAddress);
        emit FundingCreated(fundingAddress, msg.sender, _operator, _nftToken);
    }
}

