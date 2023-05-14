const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LogisticsContract", () => {
  let LogisticsContract;
  let logisticsContract;
  let owner,
    moderator1,
    moderator2,
    creator1,
    creator2,
    transactor1,
    transactor2,
    nonWhitelisted;
  let moderators, creators, transactors;

  beforeEach(async () => {
    LogisticsContract = await ethers.getContractFactory("LogisticsContract");
    [
      owner,
      moderator1,
      moderator2,
      creator1,
      creator2,
      transactor1,
      transactor2,
      nonWhitelisted,
    ] = await ethers.getSigners();
    moderators = [moderator1.address, moderator2.address];
    creators = [creator1.address, creator2.address];
    transactors = [transactor1.address, transactor2.address];
    logisticsContract = await LogisticsContract.deploy(moderators);
    await logisticsContract.deployed();
  });

  describe("Deployment", () => {
    it("Should set the owner and initial moderators correctly", async () => {
      expect(await logisticsContract.owner()).to.equal(owner.address);
      expect(await logisticsContract.moderators(owner.address)).to.be.true;
      expect(await logisticsContract.moderators(moderator1.address)).to.be.true;
      expect(await logisticsContract.moderators(moderator2.address)).to.be.true;
    });
  });

  describe("Moderator-related functions", () => {
    it("Should add a new moderator", async () => {
      await logisticsContract
        .connect(moderator1)
        .addModerator(nonWhitelisted.address);
      expect(await logisticsContract.moderators(nonWhitelisted.address)).to.be
        .true;
    });

    it("Should remove a moderator", async () => {
      await logisticsContract
        .connect(moderator1)
        .removeModerator(moderator2.address);
      expect(await logisticsContract.moderators(moderator2.address)).to.be
        .false;
    });

    it("Should fail to add a moderator by a non-moderator", async () => {
      await expect(
        logisticsContract
          .connect(nonWhitelisted)
          .addModerator(nonWhitelisted.address)
      ).to.be.revertedWith("Only moderator can invoke this method");
    });
  });

  describe("Creator and transactor white-listing", () => {
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      await logisticsContract.connect(moderator1).addTransactors(transactors);
    });

    it("Should add creators to the white-list", async () => {
      expect(await logisticsContract.creatorsWhiteList(creator1.address)).to.be
        .true;
      expect(await logisticsContract.creatorsWhiteList(creator2.address)).to.be
        .true;
    });

    it("Should remove creators from the white-list", async () => {
      await logisticsContract
        .connect(moderator1)
        .removeCreators([creator1.address]);
      expect(await logisticsContract.creatorsWhiteList(creator1.address)).to.be
        .false;
      expect(await logisticsContract.creatorsWhiteList(creator2.address)).to.be
        .true;
    });

    it("Should add transactors to the white-list", async () => {
      expect(await logisticsContract.transactorsWhiteList(transactor1.address))
        .to.be.true;
      expect(await logisticsContract.transactorsWhiteList(transactor2.address))
        .to.be.true;
    });
    it("Should remove transactors from the white-list", async () => {
      await logisticsContract
        .connect(moderator1)
        .removeTransactors([transactor1.address]);
      expect(await logisticsContract.transactorsWhiteList(transactor1.address))
        .to.be.false;
      expect(await logisticsContract.transactorsWhiteList(transactor2.address))
        .to.be.true;
    });

    it("Should fail to add creators and transactors by a non-moderator", async () => {
      await expect(
        logisticsContract
          .connect(nonWhitelisted)
          .addCreators([nonWhitelisted.address])
      ).to.be.revertedWith("Only moderator can invoke this method");
      await expect(
        logisticsContract
          .connect(nonWhitelisted)
          .addTransactors([nonWhitelisted.address])
      ).to.be.revertedWith("Only moderator can invoke this method");
    });
  });

  describe("Shipment creation", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
    });
    it("Should create a shipment with valid inputs", async () => {
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.sender).to.equal(creator1.address);
      expect(shipment.currentOwner).to.equal(creator1.address);
      expect(shipment.temperature).to.equal("10.5");
      expect(shipment.state).to.equal(0);
    });

    it("Should fail to create a shipment without being on the creators white-list", async () => {
      await expect(
        logisticsContract
          .connect(nonWhitelisted)
          .createShipment(creator1.address, "10.5")
      ).to.be.revertedWith("You do not have permissions");
    });

    it("Should emit the ShipmentCreated event", async () => {
      await expect(
        logisticsContract
          .connect(creator1)
          .createShipment(creator2.address, "10.5")
      )
        .to.emit(logisticsContract, "ShipmentCreated")
        .withArgs(
          shipmentId.add(1),
          creator1.address,
          creator2.address,
          "10.5"
        );
    });
  });

  describe("Starting a shipment", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
    });
    it("Should start a shipment with valid inputs", async () => {
      await logisticsContract.connect(creator1).startShipment(shipmentId);
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.state).to.equal(1);
    });

    it("Should fail to start a shipment by a non-sender", async () => {
      await expect(
        logisticsContract.connect(creator2).startShipment(shipmentId)
      ).to.be.revertedWith("Only sender can start shipment");
    });

    it("Should fail to start a shipment that is not in the 'Created' state", async () => {
      await logisticsContract.connect(creator1).startShipment(shipmentId);
      await expect(
        logisticsContract.connect(creator1).startShipment(shipmentId)
      ).to.be.revertedWith("Shipment is not in created state");
    });

    it("Should emit the ShipmentInTransit event", async () => {
      await expect(
        logisticsContract.connect(creator1).startShipment(shipmentId)
      )
        .to.emit(logisticsContract, "ShipmentInTransit")
        .withArgs(shipmentId);
    });
  });

  describe("Transact shipment", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      await logisticsContract.connect(moderator1).addTransactors(transactors);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
    });
    it("Should transact a shipment with valid inputs", async () => {
      await logisticsContract
        .connect(transactor1)
        .transactShipment(shipmentId, 1, "Damaged package");
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.currentOwner).to.equal(transactor1.address);
      expect(shipment.shipmentState).to.equal(1);
      expect(shipment.comments).to.equal("Damaged package");
    });

    it("Should fail to transact a shipment without being on the transactors white-list", async () => {
      await expect(
        logisticsContract
          .connect(nonWhitelisted)
          .transactShipment(shipmentId, 1, "Damaged package")
      ).to.be.revertedWith("You do not have permissions");
    });

    it("Should fail to transact a shipment that is not in the 'Created' state", async () => {
      await logisticsContract.connect(creator1).startShipment(shipmentId);
      await expect(
        logisticsContract
          .connect(transactor1)
          .transactShipment(shipmentId, 1, "Damaged package")
      ).to.be.revertedWith("Shipment is not in created state");
    });

    it("Should emit the ShipmentTransacted event", async () => {
      const transactShipmentTx = await logisticsContract
        .connect(transactor1)
        .transactShipment(shipmentId, 1, "Damaged package");
      const receipt = await transactShipmentTx.wait();
      const timestamp = receipt.timestamp;
      const shipmentTransactedEvent = receipt.events.find(
        (e) => e.event === "ShipmentTransacted"
      );
      const {
        shipmentId: eventShipmentId,
        _shipmentState,
        _comments,
        _timestamp,
      } = shipmentTransactedEvent.args;
      expect(eventShipmentId).to.equal(shipmentId);
      expect(_shipmentState).to.equal(1);
      expect(_comments).to.equal("Damaged package");
      expect(_timestamp).to.equal(timestamp);
    });
  });

  describe("Update shipment temperature", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      await logisticsContract.connect(moderator1).addTransactors(transactors);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
      await logisticsContract
        .connect(transactor1)
        .transactShipment(shipmentId, 0, "Temperature check");
    });

    it("Should update the shipment temperature with valid inputs", async () => {
      await logisticsContract
        .connect(transactor1)
        .updateShipmentTemperature(shipmentId, "12.5");
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.temperature).to.equal("12.5");
    });

    it("Should fail to update the shipment temperature by a non-owner", async () => {
      await expect(
        logisticsContract
          .connect(transactor2)
          .updateShipmentTemperature(shipmentId, "12.5")
      ).to.be.revertedWith("You do not have permissions");
    });

    it("Should fail to update the shipment temperature if the shipment is not in the 'Created' state", async () => {
      await logisticsContract.connect(creator1).startShipment(shipmentId);
      await expect(
        logisticsContract
          .connect(transactor1)
          .updateShipmentTemperature(shipmentId, "12.5")
      ).to.be.revertedWith("Shipment is not in created state");
    });
  });

  describe("Deliver shipment", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      await logisticsContract.connect(moderator1).addTransactors(transactors);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
      await logisticsContract.connect(creator1).startShipment(shipmentId);
    });
    it("Should deliver a shipment with valid inputs", async () => {
      await logisticsContract
        .connect(creator2)
        .deliverShipment(shipmentId, 0, "Shipment Deliverd");
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.state).to.equal(2);
    });

    it("Should fail to deliver a shipment by a non-recipient", async () => {
      await expect(
        logisticsContract
          .connect(creator1)
          .deliverShipment(shipmentId, 0, "Shipment Deliverd")
      ).to.be.revertedWith("Only recipient can deliver shipment");
    });

    it("Should fail to deliver a shipment that is not in the 'InTransit' state", async () => {
      await logisticsContract.connect(creator1).cancelShipment(shipmentId);
      await expect(
        logisticsContract.connect(creator2).deliverShipment(shipmentId)
      ).to.be.revertedWith("Shipment is not in transit");
    });

    it("Should emit the ShipmentDelivered event", async () => {
      await expect(
        logisticsContract
          .connect(creator2)
          .deliverShipment(shipmentId, 0, "Shipment Deliverd")
      )
        .to.emit(logisticsContract, "ShipmentDelivered")
        .withArgs(shipmentId);
    });
  });

  describe("Cancel shipment", () => {
    let shipmentId;
    beforeEach(async () => {
      await logisticsContract.connect(moderator1).addCreators(creators);
      const createShipmentTx = await logisticsContract
        .connect(creator1)
        .createShipment(creator2.address, "10.5");
      const receipt = await createShipmentTx.wait();
      const shipmentCreatedEvent = receipt.events.find(
        (e) => e.event === "ShipmentCreated"
      );
      shipmentId = shipmentCreatedEvent.args.shipmentId;
    });
    it("Should cancel a shipment with valid inputs", async () => {
      await logisticsContract.connect(creator1).cancelShipment(shipmentId);
      const shipment = await logisticsContract.shipments(shipmentId);
      expect(shipment.state).to.equal(3);
    });

    it("Should fail to cancel a shipment by a non-sender", async () => {
      await expect(
        logisticsContract.connect(creator2).cancelShipment(shipmentId)
      ).to.be.revertedWith("Only sender can cancel shipment");
    });

    it("Should fail to cancel a shipment that is not in the 'Created' state", async () => {
      await logisticsContract.connect(creator1).startShipment(shipmentId);
      await expect(
        logisticsContract.connect(creator1).cancelShipment(shipmentId)
      ).to.be.revertedWith("Shipment is not in created state");
    });

    it("Should emit the ShipmentCancelled event", async () => {
      await expect(
        logisticsContract.connect(creator1).cancelShipment(shipmentId)
      )
        .to.emit(logisticsContract, "ShipmentCancelled")
        .withArgs(shipmentId);
    });
  });
});
