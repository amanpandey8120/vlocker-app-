// Assuming your model file is named 'loan.model.js'
const Loan = require("../models/CustomerLoan.model");
const Customer = require("../models/customer.model"); // Needed for the security check

// POST /customers/:customerId/loans - Create a new loan for a customer
const createCustomerloan = async (req, res) => {
  const { customerId } = req.params;
  try {
    console.log("Creating loan for customerId:", customerId);
    // FIX #2: Add a security check to ensure the parent customer exists and belongs to the user
    const customer = await Customer.findOne({
      _id: customerId,
      createdBy: req.userId,
    });
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found or you are not authorized" });
    }

    const loan = new Loan({
      ...req.body,
      customerId: customerId,
      createdBy: req.userId,
    });
    await loan.save();
    res
      .status(201)
      .json({ message: "Customer Loan created successfully", data: loan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Error creating customer loan",
        error: "A loan with this IMEI number already exists.",
      });
    }
    res
      .status(400)
      .json({ message: "Error creating customer Loan", error: error.message });
  }
};

// GET /customers/:customerId/loans - Get all loans for a specific customer
const getAllCustomersloan = async (req, res) => {
  try {
    console.log("Fetching loans for customerId:", req.params.customerId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // This is the correct filter for finding documents
    const filter = {
      customerId: req.params.customerId,
      createdBy: req.userId,
    };

    const loans = await Loan.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // FIX #4: The count must use the exact same filter to be accurate
    const totalLoans = await Loan.countDocuments(filter);

    const totalPages = Math.ceil(totalLoans / limit);
    const pagination = {
      totalLoans,
      totalPages: totalPages,
      currentPage: page,
    };

    res.status(200).json({
      message: "Customers Loan retrieved successfully",
      data: loans,
      pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving customers Loan",
      error: error.message,
    });
  }
};

// GET /customers/:customerId/loans/:loanId - Get a single loan by ID
const getCustomerloanById = async (req, res) => {
  try {
    console.log("Fetching loan with ID:", req.params.loanId , req.userId);
    const loan = await Loan.findOne({
      _id: req.params.loanId,  
      createdBy: req.userId,
    });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan found", data: loan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding customer Loan", error: error.message });
  }
};

const updateCustomerloan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      {
        _id: req.params.loanId, 
        createdBy: req.userId,
      },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({
        message: "Customer loan not found or you are not authorized to update",
      });
    }
    res
      .status(200)
      .json({ message: "Customer loan updated successfully", data: loan });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating customer loan", error: error.message });
  }
};

const deleteCustomerloan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndDelete({
      _id: req.params.loanId, 
    
      createdBy: req.userId,
    });

    if (!loan) {
      return res.status(404).json({
        message: "Customer loan not found or you are not authorized to delete",
      });
    }
    res.status(200).json({ message: "Customer loan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer loan", error: error.message });
  }
};

module.exports = {
  createCustomerloan,
  getAllCustomersloan,
  getCustomerloanById,
  updateCustomerloan,
  deleteCustomerloan,
};
