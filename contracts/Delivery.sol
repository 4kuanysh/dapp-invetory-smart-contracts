// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract Delivery {
    struct Shipment {
        string product;
        uint256 quantity;
        string from;
        string to;
        uint256 deliveryDate;
        string status;
    }

    Shipment[] public shipments;

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
}
