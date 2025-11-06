const Customer = require("../models/customer.model");

const sendCustomerOtp = async (req, res) => {
  const { customerName, customerMobileNumber, address } = req.body;

  if (!customerName || !customerMobileNumber || !address) {
    return res
      .status(400)
      .json({ message: "Name, Mobile Number, and Address are required." });
  }

  try {
    const existingVerifiedCustomer = await Customer.findOne({
      customerMobileNumber,
      createdBy: req.userId,
      isVerified: true,
    });
    if (existingVerifiedCustomer) {
      return res.status(400).json({
        message: "A verified customer with this mobile number already exists.",
      });
    }

    const otp ="123456"  ||  Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); 


    await Customer.findOneAndUpdate(
      { customerMobileNumber  ,createdBy: req.userId},
      {
        customerName,
        address,
        createdBy: req.userId,
        otp,
        otpExpires,
        isVerified: false,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({otp:"123456" ,message: "OTP sent to customer successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending OTP", error: error.message });
  }
};
const verifyOtpAndCreateCustomer = async (req, res) => {
  const { customerMobileNumber, otp } = req.body;

  if (!customerMobileNumber || !otp) {
    return res
      .status(400)
      .json({ message: "Mobile Number and OTP are required." });
  }

  try {
    const customer = await Customer.findOne({ customerMobileNumber , createdBy: req.userId });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found. Please send OTP first." });
    }
    if (customer.isVerified) {
      return res.status(400).json({ message: "Customer is already verified." });
    }
    if (customer.otp !== otp || customer.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    customer.isVerified = true;
    customer.otp = undefined;
    customer.otpExpires = undefined;
    await customer.save();

    res.status(201).json({
      message: "Customer verified and created successfully",
      data:customer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.userId, isVerified: true }; 

    const customers = await Customer.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCustomers = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

    const pagination = {
      totalCustomers: totalCustomers,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    };

    res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers, 
      pagination: pagination,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving customers", error: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer found", data:customer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding customer", error: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found or you are not authorized" });
    }
    res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating customer", error: error.message });
  }
};
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found or you are not authorized" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};

const completeAadhaarKYC = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { aadhaarNumber } = req.body;
    const aadhaarFront = req.files["aadhaarFront"]
      ? req.files["aadhaarFront"][0].location
      : null;
    const aadhaarBack = req.files["aadhaarBack"]
      ? req.files["aadhaarBack"][0].location
      : null;

    if (!aadhaarNumber || !aadhaarFront || !aadhaarBack) {
      return res
        .status(400)
        .json({ message: "All Aadhaar fields are required" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        "kyc.aadhaar.number": aadhaarNumber,
        "kyc.aadhaar.frontPhoto": aadhaarFront,
        "kyc.aadhaar.backPhoto": aadhaarBack,
      },
      { new: true }
    );

    console.log(updatedCustomer);
    res.status(200).json({ data: updatedCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const completePanKYC = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { panNumber } = req.body;
    const panPhoto = req.file ? req.file.location : null;

    if (!panNumber || !panPhoto) {
      return res
        .status(400)
        .json({ message: "PAN number and photo are required" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      {
        "kyc.pan.number": panNumber,
        "kyc.pan.photo": panPhoto,
      },
      { new: true }
    );

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add Bank Passbook
const addBankPassbook = async (req, res) => {
  try {
    const customerId = req.params.id;
    const bankPassbookPhoto = req.file ? req.file.location : null;

    if (!bankPassbookPhoto) {
      return res
        .status(400)
        .json({ message: "Bank passbook photo is required" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { "kyc.bankPassbook.photo": bankPassbookPhoto },
      { new: true }
    );

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendCustomerOtp,
  verifyOtpAndCreateCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  completeAadhaarKYC,
  completePanKYC,
  addBankPassbook,
};
