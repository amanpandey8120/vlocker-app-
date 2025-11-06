const Bank = require("../models/CustomerBank.model");
const Customer = require("../models/customer.model");

const addBank = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { bankName, accountNumber, accountHolderName, ifscCode } = req.body;

    if (!bankName || !accountNumber || !accountHolderName || !ifscCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const bank = await Bank.create({
      customerId,
      bankName,
      accountNumber,
      accountHolderName,
      ifscCode,
    });

    res.status(201).json({ message: "Bank added successfully", data: bank });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding bank", error: error.message });
  }
};

const getBanksByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const banks = await Bank.find({ customerId });

    res.status(200).json({
      message: "Banks retrieved successfully",
      data: banks,
      total: banks.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving banks", error: error.message });
  }
};
const getBankById = async (req, res) => {
  try {
    const { bankId } = req.params;
    const bank = await Bank.findById(bankId);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res
      .status(200)
      .json({ message: "Bank retrieved successfully", data: bank });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving bank", error: error.message });
  }
};

// Update Bank
const updateBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const updates = req.body;

    const bank = await Bank.findByIdAndUpdate(bankId, updates, { new: true });

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank updated successfully", data: bank });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating bank", error: error.message });
  }
};

// Delete Bank
const deleteBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const bank = await Bank.findByIdAndDelete(bankId);

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting bank", error: error.message });
  }
};

module.exports = {
  addBank,
  getBanksByCustomer,
  getBankById,
  updateBank,
  deleteBank,
};
