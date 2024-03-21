const Product = require("../models/product.model");
const Image = require('../models/AllImages')

exports.createProduct = async (req, res) => {
  try {
    // Destructure all fields from req.body as per the schema
    const {
      productName,
      images,
      property,
      sizes,
      originalPrice,
      discoPrice,
      vendor,
      sku,
      avilable,
      productType,
      Desc,
      Category,
      addInfo
    } = req.body;

    // Create a new product instance
    const newProduct = new Product({
      productName,
      images, // Assuming images already contain the correct structure { img: "url" }
      property,
      sizes, // Included sizes in the product creation
      originalPrice,
      discoPrice,
      vendor,
      sku,
      avilable,
      productType,
      Desc,
      Category,
      addInfo,
    });

    // Save the new product to the database
    await newProduct.save();

    // Respond with the created product
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./temp";
    // Check if the directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.ImageUpload = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const imageUrls = [];

    // Upload each file to Cloudinary
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (result && result.url) {
        imageUrls.push(result.url); // Store the URL of the uploaded image
      }
      // Delete the temporary file after upload
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ message: "Images uploaded successfully", imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const allImages = await Image.find(); // Correctly await the promise returned by find()
    res.status(200).json(allImages); // Send the found images as a response
  } catch (error) {
    console.error(error); // It's good practice to use console.error for errors
    res.status(500).json({ error: 'Internal Server Error' }); // Provide a response on error
  }
};
// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    // Fetch the existing product data
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Merge the existing data with the updated fields
    const mergedFields = { ...existingProduct.toObject(), ...updatedFields };

    // Update the product with the merged fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: mergedFields },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
};


// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: products,
      message: "Products Found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
};

// Get a single product
exports.getOneProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productData = await Product.findById(id);

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: productData,
      message: "Product found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Error",
    });
  }
};

exports.getProductByKeywords = async (req, res) => {
  try {
    const { category } = req.params;
    console.log(req.params)
    let products = await Product.find({ Category: category });

    // Check if products were found
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for the given keyword' });
    }

    // Send the products as a response
    res.status(200).json({
      success: true,
      data: products,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getProductsByProductNameOrCategory = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;
    const pageSize = 10;
    const currentPage = Number(req.query.currentPage) || 1;

    const searchWords = searchTerm.split(' ');

    const orConditions = searchWords.map(word => ({
      $or: [
        { productName: { $regex: new RegExp(word, 'i') } },
        { category: { $regex: new RegExp(word, 'i') } }
      ]
    }));

    const products = await Product.find({
      $or: orConditions
    })
      .limit(pageSize)
      .skip((currentPage - 1) * pageSize);

    const totalProducts = await Product.countDocuments({
      $or: orConditions
    });

    const totalPages = Math.ceil(totalProducts / pageSize);

    res.status(200).json({
      totalCount: totalProducts,
      totalPages: totalPages,
      currentPage: currentPage,
      pageSize: pageSize,
      data: products
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.getAllCategoryWithImagesAndNumberOfProducts = async (req, res) => {
  try {
    const categoriesWithInfo = await Product.aggregate([
      // Group products by category
      {
        $group: {
          _id: "$Category",
          numberOfProducts: { $sum: 1 }, // Count the number of products in each category
          firstImage: { $first: "$images.img" } // Get the first image URL of each category
        }
      },
      // Project to reshape the output
      {
        $project: {
          _id: 0,
          category: "$_id",
          image: { $arrayElemAt: ["$firstImage", 0] },
          numberOfProducts: 1
        }
      }
    ]);

    res.status(200).json(categoriesWithInfo);
  } catch (error) {
    console.error('Error fetching categories with images and number of products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
