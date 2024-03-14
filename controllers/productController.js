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
    // console.log(req.params)
    let products = await Product.find({ category  });
    
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
