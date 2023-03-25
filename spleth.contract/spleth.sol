// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @author Ivan
 */

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface ISplitFundsContract {
    function deposit() external payable;

    function withdraw() external;
}

contract SplitFundsContractImpl is ISplitFundsContract, Ownable {
    uint256 public balance = address(this).balance;
    address[] private userAddresses;

    struct User {
        uint256 balance;
        bool exists;
    }

    uint256 public number;

    mapping(address => User) public users;
    mapping(address => mapping(uint256 => string)) public transaction_details;

    constructor(address[] memory initialUsers) {
        users[msg.sender] = User({balance: 0, exists: true});
        userAddresses.push(msg.sender);

        for (uint256 i = 0; i < initialUsers.length; i++) {
            users[initialUsers[i]] = User({balance: 0, exists: true});
            userAddresses.push(initialUsers[i]);
        }
    }

    modifier onlyAuthorized() {
        require(users[msg.sender].exists || owner() == msg.sender);
        _;
    }

    function deposit() external payable override {
        require(users[msg.sender].exists, "User does not exist");

        users[msg.sender].balance += msg.value;
        balance += msg.value;
    }

    function addUser(address userAddress) public onlyAuthorized {
        require(!users[userAddress].exists, "User already exists");
        users[userAddress] = User({balance: 0, exists: true});
        userAddresses.push(userAddress);
    }

    function spend(
        uint256 amount,
        address payable recipient,
        string calldata information
    ) external onlyAuthorized {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= balance, "Insufficient funds");

        transaction_details[recipient][amount] = information;

        uint256 numUsers = userAddresses.length;
        uint256 amountPerUser = amount / numUsers;

        for (uint256 i = 0; i < numUsers; i++) {
            users[userAddresses[i]].balance -= amountPerUser;
            payable(recipient).transfer(amountPerUser);
            balance -= amountPerUser;
        }
    }

    function withdraw() external override onlyAuthorized {
        require(
            users[msg.sender].balance > 0,
            "You have no balance to withdraw"
        );

        uint256 amount = users[msg.sender].balance;
        users[msg.sender].balance = 0;
        balance -= amount;

        payable(msg.sender).transfer(amount);
    }

    function getBalance(address _myAddress) external view returns (uint256) {
        return users[_myAddress].balance;
    }

    function getAllUsers() external view returns (address[] memory) {
        return userAddresses;
    }
}

contract SplitFundsContractFactory {
    mapping(string => address) public contractAddr;
    address[] public allAddresses;

    function createContract(
        address[] memory addresses,
        string calldata title
    ) external returns (address) {
        SplitFundsContractImpl newContract = new SplitFundsContractImpl(
            addresses
        );
        contractAddr[title] = address(newContract);
        allAddresses.push(address(newContract));
        return contractAddr[title];
    }

    function getAllAddresses() public view returns (address[] memory) {
        return allAddresses;
    }
}
