// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogisticsContract {
    uint256 private nonce = 0;

    enum TransportState {
        Created,
        InTransit,
        Delivered
    }
    enum ShipmentState {
        Good,
        Bad
    }

    struct Shipment {
        address sender;
        address currentOwner;
        uint256 timestamp;
        string temperature;
        string comments;
        ShipmentState shipmentState;
        TransportState state;
    }

    mapping(uint256 => Shipment) public shipments;
    mapping(address => bool) creatorsWhiteList;
    mapping(address => bool) transactorsWhiteList;
    mapping(address => bool) moderators;

    event ShipmentCreated(
        uint256 shipmentId,
        address sender,
        address receiver,
        string temperature
    );
    event ShipmentInTransit(uint256 shipmentId);
    event ShipmentDelivered(uint256 shipmentId, uint256 timestamp);
    event ShipmentTransacted(
        uint256 shipmentId,
        ShipmentState _shipmentState,
        string _comments,
        uint256 timestamp
    );

    address public owner;

    constructor(address[] memory _moderators) {
        owner = msg.sender;
        moderators[msg.sender] = true;
        for (uint256 i = 0; i < _moderators.length; i++) {
            moderators[_moderators[i]] = true;
        }
    }

    function addModerator(address _moderator) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        moderators[_moderator] = true;
    }

    function removeModerator(address _moderator) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        moderators[_moderator] = false;
    }

    function addCreators(address[] memory _data) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        for (uint256 i = 0; i < _data.length; i++) {
            creatorsWhiteList[_data[i]] = true;
        }
    }

    function removeCreators(address[] memory _data) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        for (uint256 i = 0; i < _data.length; i++) {
            creatorsWhiteList[_data[i]] = false;
        }
    }

    function addTransactors(address[] memory _data) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        for (uint256 i = 0; i < _data.length; i++) {
            transactorsWhiteList[_data[i]] = true;
        }
    }

    function removeTransactors(address[] memory _data) public {
        require(
            moderators[msg.sender],
            "Only moderator can invoke this method"
        );
        for (uint256 i = 0; i < _data.length; i++) {
            transactorsWhiteList[_data[i]] = false;
        }
    }

    function createShipment(
        address receiver,
        string memory temperature
    ) public returns (uint256) {
        uint256 shipmentId = nonce++;
        require(
            shipments[shipmentId].sender == address(0),
            "Shipment already exists"
        );
        require(creatorsWhiteList[msg.sender], "You do not have permissions");
        shipments[shipmentId] = Shipment(
            msg.sender,
            msg.sender,
            block.timestamp,
            temperature,
            "Shipment created",
            ShipmentState.Good,
            TransportState.Created
        );
        emit ShipmentCreated(shipmentId, msg.sender, receiver, temperature);
        return shipmentId;
    }

    function startShipment(uint256 shipmentId) public {
        require(
            shipments[shipmentId].sender == msg.sender,
            "Only sender can start shipment"
        );
        require(
            shipments[shipmentId].state == TransportState.Created,
            "Shipment is not in created state"
        );
        shipments[shipmentId].state = TransportState.InTransit;
        emit ShipmentInTransit(shipmentId);
    }

    function transactShipment(
        uint256 shipmentId,
        ShipmentState _shipmentState,
        string memory _comments
    ) public {
        require(
            shipments[shipmentId].state == TransportState.Created,
            "Shipment is not in created state"
        );
        require(
            transactorsWhiteList[msg.sender],
            "You do not have permissions"
        );
        shipments[shipmentId].currentOwner = msg.sender;
        shipments[shipmentId].shipmentState = _shipmentState;
        shipments[shipmentId].comments = _comments;
        shipments[shipmentId].timestamp = block.timestamp;
        emit ShipmentTransacted(
            shipmentId,
            _shipmentState,
            _comments,
            block.timestamp
        );
    }

    function updateShipmentTemperature(
        uint256 shipmentId,
        string memory _temperature
    ) public {
        require(
            shipments[shipmentId].state == TransportState.Created,
            "Shipment is not in created state"
        );
        require(
            shipments[shipmentId].currentOwner == msg.sender,
            "You do not have permissions"
        );
        shipments[shipmentId].temperature = _temperature;
    }

    function deliverShipment(
        uint256 shipmentId,
        ShipmentState _shipmentState,
        string memory _comments
    ) public {
        require(
            shipments[shipmentId].state == TransportState.InTransit,
            "Shipment is not in transit"
        );
        shipments[shipmentId].state = TransportState.Delivered;
        shipments[shipmentId].timestamp = block.timestamp;
        shipments[shipmentId].shipmentState = _shipmentState;
        shipments[shipmentId].comments = _comments;
        emit ShipmentDelivered(shipmentId, block.timestamp);
    }
}
