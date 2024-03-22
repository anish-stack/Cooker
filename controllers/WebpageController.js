const Banner = require('../models/Banners.model');
const Category = require('../models/Categorey.model');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Tags = require('../models/Tags.model');
const Vouchers = require('../models/Vouchers.model');
const storage = multer.diskStorage({});
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limiting file size to 5MB, adjust as needed
  fileFilter: (req, file, cb) => {
    // Check file type, you can customize this according to your requirements
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  },
}).single('images'); // Ensure that the field name here matches the one from the frontend

exports.createBanner = async (req, res) => {
  try {
    console.log(req.body);
    const { title, active, image } = req.body;
    
    // Initialize an array to hold names of missing fields
    let missingFields = [];

    // Check for required fields and add the field name to the array if missing
    if (!title) missingFields.push('title');
    if (!image) missingFields.push('image');

    // If there are any missing fields, return a 400 response with details
    if (missingFields.length > 0) {
      return res.status(400).json({ msg: `Please fill out all fields: ${missingFields.join(', ')}` });
    }

    // Create new banner with provided data
    const newBanner = new Banner({
      title,
      image,
      active: active ? true : false,
    });

    // Save banner to database
    await newBanner.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: newBanner,
      msg: 'Banner Created Successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getllbanner = async (req, res) => {
  try {
    const AllBanner = await Banner.find()
    //console.log(AllBanner);
    if (AllBanner.length === 0) {
      return res.status(404).json({ msg: 'No Data Found' });
    }
    res.status(200).json({
      count: AllBanner.length,
      data: AllBanner
    });
  } catch (error) {
    console.log(error)
  }
}
exports.getAllActiveBanners = async (req, res) => {
  try {
    const activeBanners = await Banner.find({ active: true });

    if (activeBanners.length === 0) {
      return res.status(404).json({ msg: 'No active banners found' });
    }

    res.status(200).json({
      count: activeBanners.length,
      data: activeBanners
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllInactiveBanners = async (req, res) => {
  try {
    const inactiveBanners = await Banner.find({ active: false });

    if (inactiveBanners.length === 0) {
      return res.status(404).json({ msg: 'No inactive banners found' });
    }

    res.status(200).json({
      count: inactiveBanners.length,
      data: inactiveBanners
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    // Check if bannerId is provided
    if (!bannerId) {
      return res.status(400).json({ msg: "Banner ID is required" });
    }

    // Find the banner by ID and delete it
    const deletedBanner = await Banner.findByIdAndDelete(bannerId);

    // Check if banner was found and deleted
    if (!deletedBanner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Banner deleted successfully",
      deletedBanner
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.markInactiveBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    // Check if bannerId is provided
    if (!bannerId) {
      return res.status(400).json({ msg: "Banner ID is required" });
    }

    // Find the banner by ID and update its active status to false
    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { active: false },
      { new: true }
    );

    // Check if banner was found and updated
    if (!updatedBanner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Banner marked as inactive successfully",
      updatedBanner
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 exports.toggleBannerActiveStatus = async (req, res) => {
  try {
    const bannerId = req.params.id;
    // Check if bannerId is provided
    if (!bannerId) {
      return res.status(400).json({ msg: "Banner ID is required" });
    }

    // Find the banner by ID
    const banner = await Banner.findById(bannerId);
    // Check if banner exists
    if (!banner) {
      return res.status(404).json({ msg: "Banner not found" });
    }

    // Toggle the active status of the banner
    banner.active = !banner.active;
    await banner.save();

    // Return success response with updated banner
    res.status(200).json({
      success: true,
      msg: `Banner status toggled successfully. Active status is now: ${banner.active ? 'Active' : 'Inactive'}`,
      updatedBanner: banner
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.makeCategories = async (req, res) => {
  try {
    const { title, CatImg } = req.body;

    // Check if required fields are present
    if (!title) {
      return res.status(400).json({ msg: 'Title is required for creating a category' });
    }

    // Create new category
    const newCategory = new Category({
      title,
      CatImg,
    });

    // Save the new category to the database
    await newCategory.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: newCategory,
      msg: 'Category created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get all categories
  exports.getAllCategories = async (req, res) => {
    try {
      // Fetch all categories from the database
      const categories = await Category.find();

      // Return the categories as a response
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Function to delete a category by ID
exports.deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category with the given ID exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Delete the category from the database
    await Category.findByIdAndDelete(categoryId);

    // Return success response
    res.status(200).json({ success: true, msg: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.makeTags = async (req, res) => {
  try {
    const { title, TagColour } = req.body;

    // Check if required fields are present
    if (!title || !TagColour) {
      return res.status(400).json({ msg: 'Title and Tag Colour are required for creating a tag' });
    }

    // Create new tag
    const newTag = new Tags({
      title,
      TagColour,
    });

    // Save the new tag to the database
    await newTag.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: newTag,
      msg: 'Tag created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get all tags
exports.getTags = async (req, res) => {
  try {
    // Fetch all tags from the database
    const tags = await Tags.find();

    // Return the tags as a response
    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to edit a tag by ID
exports.editTags = async (req, res) => {
  try {
    const tagId = req.params.id;
    const { title, TagColour } = req.body;

    // Check if tag with the given ID exists
    let tag = await Tags.findById(tagId);
    if (!tag) {
      return res.status(404).json({ msg: 'Tag not found' });
    }

    // Update the tag with the provided data
    tag.title = title || tag.title;
    tag.TagColour = TagColour || tag.TagColour;

    // Save the updated tag to the database
    await tag.save();

    // Return success response
    res.status(200).json({
      success: true,
      data: tag,
      msg: 'Tag updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete a tag by ID
exports.deleteTags = async (req, res) => {
  try {
    const tagId = req.params.id;

    // Check if tag with the given ID exists
    const tag = await Tags.findById(tagId);
    if (!tag) {
      return res.status(404).json({ msg: 'Tag not found' });
    }

    // Delete the tag from the database
    await Tags.findByIdAndDelete(tagId);

    // Return success response
    res.status(200).json({ success: true, msg: 'Tag deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.createVouchers = async (req, res) => {
  try {
    const { title, OffPercentage, howMuchTimeApply } = req.body;

    // Check if required fields are present
    if (!title || !OffPercentage ) {
      return res.status(400).json({ msg: 'Title, Off Percentage, and How Much Time Apply are required for creating a voucher' });
    }

    // Create new voucher
    const newVoucher = new Vouchers({
      title,
      OffPercentage,
      howMuchTimeApply,
    });

    // Save the new voucher to the database
    await newVoucher.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: newVoucher,
      msg: 'Voucher created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get all vouchers
exports.getVouchers = async (req, res) => {
  try {
    // Fetch all vouchers from the database
    const vouchers = await Vouchers.find();

    // Return the vouchers as a response
    res.status(200).json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to edit a voucher by ID
exports.editVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    const { title, OffPercentage, howMuchTimeApply } = req.body;

    // Check if voucher with the given ID exists
    let voucher = await Vouchers.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ msg: 'Voucher not found' });
    }

    // Update the voucher with the provided data
    voucher.title = title || voucher.title;
    voucher.OffPercentage = OffPercentage || voucher.OffPercentage;
    voucher.howMuchTimeApply = howMuchTimeApply || voucher.howMuchTimeApply;

    // Save the updated voucher to the database
    await voucher.save();

    // Return success response
    res.status(200).json({
      success: true,
      data: voucher,
      msg: 'Voucher updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to activate/deactivate a voucher by ID
exports.activateAndDeactivateVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    const { isActive } = req.body;

    // Check if voucher with the given ID exists
    let voucher = await Vouchers.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ msg: 'Voucher not found' });
    }

    // Update the voucher's isActive status
    voucher.isActive = isActive;

    // Save the updated voucher to the database
    await voucher.save();

    // Return success response
    res.status(200).json({
      success: true,
      data: voucher,
      msg: `Voucher ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete a voucher by ID
exports.deleteVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;

    // Check if voucher with the given ID exists
    const voucher = await Vouchers.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ msg: 'Voucher not found' });
    }

    // Delete the voucher from the database
    await Vouchers.findByIdAndDelete(voucherId);

    // Return success response
    res.status(200).json({ success: true, msg: 'Voucher deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};