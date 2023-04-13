// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract Inventory {
    struct Item {
        string name;
        uint256 quantity;
        string location;
        uint256 arrivalDate;
        uint256 departureDate;
    }

    Item[] public inventory;

    struct Order {
        string product;
        uint256 quantity;
        uint256 price;
        string status;
    }

    Order[] public orders;

    struct Shipment {
        string product;
        uint256 quantity;
        string from;
        string to;
        uint256 deliveryDate;
        string status;
    }

    Shipment[] public shipments;

    struct Customer {
        uint256 customerId;
        string name;
        string location;
        string email;
    }

    struct Supplier {
        uint256 supplierId;
        string name;
        string location;
        string email;
    }

    Customer[] public customers;
    Supplier[] public suppliers;

    function addItem(
        string memory _name,
        uint256 _quantity,
        string memory _location,
        uint256 _arrivalDate
    ) public {
        inventory.push(Item(_name, _quantity, _location, _arrivalDate, 0));
    }

    function updateItem(
        uint256 _index,
        uint256 _quantity,
        string memory _location,
        uint256 _departureDate
    ) public {
        Item storage item = inventory[_index];
        item.quantity = _quantity;
        item.location = _location;
        item.departureDate = _departureDate;
    }

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

    function addShipment(
        string memory _product,
        uint256 _quantity,
        string memory _from,
        string memory _to,
        uint256 _deliveryDate
    ) public {
        shipments.push(
            Shipment(_product, _quantity, _from, _to, _deliveryDate, "Pending")
        );
    }

    function updateShipmentStatus(
        uint256 _index,
        string memory _status
    ) public {
        Shipment storage shipment = shipments[_index];
        shipment.status = _status;
    }

    function addCustomer(
        uint256 _customerId,
        string memory _name,
        string memory _location,
        string memory _email
    ) public {
        customers.push(Customer(_customerId, _name, _location, _email));
    }

    function addSupplier(
        uint256 _supplierId,
        string memory _name,
        string memory _location,
        string memory _email
    ) public {
        suppliers.push(Supplier(_supplierId, _name, _location, _email));
    }
}
