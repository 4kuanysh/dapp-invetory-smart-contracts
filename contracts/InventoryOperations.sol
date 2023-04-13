// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract InventoryOperations {
    struct Order {
        string product;
        uint256 quantity;
        uint256 price;
        string status;
    }

    Order[] public orders;

    function addOrder(
        string memory _product,
        uint256 _quantity,
        uint256 _price
    ) public {
        orders.push(Order(_product, _quantity, _price, "Pending"));
    }

    function updateOrderStatus(uint256 _index, string memory _status) public {
        Order storage order = orders[_index];
        order.status = _status;
    }
}
