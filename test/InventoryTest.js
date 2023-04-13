const { expect } = require("chai");

describe("Inventory", function () {
  let inventory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const Inventory = await ethers.getContractFactory("Inventory");
    inventory = await Inventory.deploy();
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("should add item to inventory", async function () {
    await inventory.addItem("Test Item", 100, "Location 1", 1620876729);
    const item = await inventory.inventory(0);
    expect(item.name).to.equal("Test Item");
    expect(item.quantity).to.equal(100);
    expect(item.location).to.equal("Location 1");
    expect(item.arrivalDate).to.equal(1620876729);
  });

  it("should update item in inventory", async function () {
    await inventory.addItem("Test Item", 100, "Location 1", 1620876729);
    await inventory.updateItem(0, 50, "Location 2", 1620919761);
    const item = await inventory.inventory(0);
    expect(item.quantity).to.equal(50);
    expect(item.location).to.equal("Location 2");
    expect(item.departureDate).to.equal(1620919761);
  });

  it("should add order", async function () {
    await inventory.addOrder("Test Product", 10, 1000);
    const order = await inventory.orders(0);
    expect(order.product).to.equal("Test Product");
    expect(order.quantity).to.equal(10);
    expect(order.price).to.equal(1000);
    expect(order.status).to.equal("Pending");
  });

  it("should update order status", async function () {
    await inventory.addOrder("Test Product", 10, 1000);
    await inventory.updateOrderStatus(0, "Completed");
    const order = await inventory.orders(0);
    expect(order.status).to.equal("Completed");
  });

  it("should add shipment", async function () {
    await inventory.addShipment("Test Product", 10, "Location 1", "Location 2", 1620919761);
    const shipment = await inventory.shipments(0);
    expect(shipment.product).to.equal("Test Product");
    expect(shipment.quantity).to.equal(10);
    expect(shipment.from).to.equal("Location 1");
    expect(shipment.to).to.equal("Location 2");
    expect(shipment.deliveryDate).to.equal(1620919761);
    expect(shipment.status).to.equal("Pending");
  });

  it("should update shipment status", async function () {
    await inventory.addShipment("Test Product", 10, "Location 1", "Location 2", 1620919761);
    await inventory.updateShipmentStatus(0, "Delivered");
    const shipment = await inventory.shipments(0);
    expect(shipment.status).to.equal("Delivered");
  });

  it("should add customer", async function () {
    await inventory.addCustomer(1, "Test Customer", "Location 1", "test.customer@test.com");
    const customer = await inventory.customers(0);
    expect(customer.customerId).to.equal(1);
    expect(customer.name).to.equal("Test Customer");
    expect(customer.location).to.equal("Location 1");
    expect(customer.email).to.equal("test.customer@test.com");
  });

  it("should add supplier", async function () {
    await inventory.addSupplier(1, "Test Supplier", "Location 2", "test.supplier@test.com");
    const supplier = await inventory.suppliers(0);
    expect(supplier.supplierId).to.equal(1);
    expect(supplier.name).to.equal("Test Supplier");
    expect(supplier.location).to.equal("Location 2");
    expect(supplier.email).to.equal("test.supplier@test.com");
    });
});