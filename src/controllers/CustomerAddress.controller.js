const Address = require("../models/CustomerAddress.model");
const Customer = require("../models/customer.model");  

const createAddress = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findOne({
      _id: customerId,
      createdBy: req.userId,
    });
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found or you are not authorized" });
    }

    const address = new Address({
      ...req.body,
      customerId,
      createdBy: req.userId,
    });
    await address.save();
    res.status(201).json({ message: "Address created successfully", address });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating address", error: error.message });
  }
};

const getAddressesForCustomer = async (req, res) => {
  try {
    const addresses = await Address.find({
      createdBy: req.userId,
    });

    res.status(200).json({
      message: "Addresses retrieved successfully",
      addresses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving addresses", error: error.message });
  }
};

const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      customerId: req.params.customerId,
      createdBy: req.userId,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json({ message: "Address found", address });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding address", error: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      {
        _id: req.params.addressId,
        createdBy: req.userId,
      },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!address) {
      return res
        .status(404)
        .json({ message: "Address not found or you are not authorized" });
    }
    res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating address", error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.addressId,
      createdBy: req.userId,
    });
    if (!address) {
      return res
        .status(404)
        .json({ message: "Address not found or you are not authorized" });
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting address", error: error.message });
  }
};

module.exports = {
  createAddress,
  getAddressesForCustomer,
  getAddressById,
  updateAddress,
  deleteAddress,
};
