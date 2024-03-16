const Product = require("../models/product.model");

// Create product
exports.createProduct = async (req, res) => {

  try {
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

      // Check if required fields are present
      if ( !productName || !images || !property || !sizes || !originalPrice || !discoPrice || !vendor || !sku || !avilable || !productType || !Desc || !Category || !addInfo) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create a new product instance
      const newProduct = new Product({
     
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
      });

      // Save the new product to the database
      await newProduct.save();

      res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }

}
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
    let products = await Product.find({ Category:category });
    
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
    console.log(searchTerm)
    console.log(`Search query: ${searchTerm}`);

    const pageSize = 10;
    const currentPage = Number(req.query.currentPage) - 1 || 0;

    // Split the search term into individual words
    const searchWords = searchTerm.split(' ');

    // Construct an array of $or conditions to match any word in productName or Category
    const orConditions = searchWords.map(word => (
      { productName: { $regex: `.*${word}.*`, $options: 'i' } },
      { Category: { $regex: `.*${word}.*`, $options: 'i' } }
    ));

    // Find products matching any word in the productName or Category
    const products = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(searchTerm, 'i') } }, // Case-insensitive search for productName
        { Category: { $regex: new RegExp(searchTerm, 'i') } } // Case-insensitive search for Category
      ]
    })
    .limit(pageSize)
    .skip(currentPage * pageSize);
    
    console.log(`Products: ${products}`);

    const totalProducts = await Product.countDocuments({
      $or: [
        { $or: orConditions }
      ]
    });

    const totalPages = Math.ceil(totalProducts / pageSize);

    res.status(200).json({
      count: totalProducts,
      totalPages: totalPages,
      currentPage: currentPage + 1,
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
