const Banner = require('../models/Banners.model');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


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
}).single('image');

exports.createBanner = async (req, res) => {
  try {
    // Upload image to Cloudinary
    upload(req, res, async (err) => {
      try {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({ msg: 'Error uploading image' });
        } else if (err) {
          // An unknown error occurred when uploading
          return res.status(500).json({ msg: 'Internal server error' });
        }

        // Image upload to Cloudinary successful
        const { title, active } = req.body;
        const image = req.file;

        if (!title || !image) {
          return res.status(400).json({ msg: 'Please fill out all fields' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image.buffer, {
          folder: 'banners', // Specify the folder in Cloudinary where the image will be stored
          allowed_formats: ['jpg', 'jpeg', 'png'], // Allow only specified formats
        });

        // Create new banner with Cloudinary image URL
        const newBanner = new Banner({
          title,
          image: result.secure_url, // Cloudinary image URL
          active: active ? true : false,
        });

        // Save banner to database
        await newBanner.save();

        res.status(201).json({
          success: true,
          data: newBanner,
          msg: 'Banner Created Successfully',
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getllbanner = async(req,res)=>{
    try {
        const AllBanner = await Banner.find()
        //console.log(AllBanner);
        if(AllBanner.length === 0 ){
            return res.status(404).json({msg:'No Data Found'});
           }
           res.status(200).json({
               count:AllBanner.length,
               data:AllBanner
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
  };exports.toggleBannerActiveStatus = async (req, res) => {
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
  