const express = require('express')
const Image = require('../models/AllImages')
const { RegisterUser, LogginUser, LogoutUser, getUserIdbyUser, createContact, getContacts, getAllUser, changePassword } = require('../controllers/usercontroller')
const { createProduct, getAllProducts, getOneProduct, updateProduct, deleteProduct, getProductByKeywords, getAllCategoryWithImagesAndNumberOfProducts, getProductsByProductNameOrCategory, ImageUpload, getAllImages } = require('../controllers/productController')
const { protect } = require('../middleware/authmiddlleware')
const { CreateOrder, orderForMe, orderForAdmin, UpdateOrderStatus, getTransactionID, getSingleOrderById } = require('../controllers/orderController')
const { createBanner, getllbanner, deleteBanner, markInactiveBanner, getAllActiveBanners, toggleBannerActiveStatus, makeCategories, getAllCategories, deleteCategoryById, makeTags, getTags, deleteTags, createVouchers, editVoucher, deleteVoucher, getVouchers } = require('../controllers/WebpageController')
const upload = require('../middleware/multer')
const router = express.Router()
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

router.post('/Register', RegisterUser)
router.post('/changePassword', protect, changePassword)

router.post('/Contact', createContact)
router.get('/getContact', getContacts)
router.get('/getAllUser', getAllUser)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './temp';
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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/image', upload.array('images'), async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = [];

    // Upload each file to Cloudinary and store the URLs
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (result && result.secure_url) {
        const imageUrl = {
          Name: file.originalname,
          ImgUrl: result.secure_url
        };
        imageUrls.push(imageUrl); // Store the URL of the uploaded image
      }
      // Delete the temporary file after upload
      fs.unlinkSync(file.path);
    }

    // Save image URLs to the database
    const imageDocument = new Image({ img: imageUrls });
    await imageDocument.save();

    res.status(201).json({ message: 'Images uploaded successfully', imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Function to upload file to Cloudinary
// Function to upload file to Cloudinary
async function uploadOnCloudinary(localFilePath) {
  try {
    // Check if localFilePath exists
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });
    console.log(response)


    return response;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    return null;
  }
}

router.delete('/image/:imageId', async (req, res) => {
  try {
    const imageId = req.params.imageId;

    // Find the image in the database
    const image = await Image.findOne({ "img._id": imageId });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete the image from Cloudinary
    await deleteFromCloudinary(image.img.filter(img => img._id === imageId));

    // Remove the image from the database
    await Image.updateOne(
      { _id: image._id },
      { $pull: { img: { _id: imageId } } }
    );

    // If the image is the last one in the array, remove the document
    if (image.img.length === 1) {
      await Image.deleteOne({ _id: image._id });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
async function deleteFromCloudinary(imageUrls) {
  try {
    for (const imageUrl of imageUrls) {
      // Extract the public ID from the Cloudinary image URL
      const publicId = imageUrl.ImgUrl.split('/').pop().split('.')[0];
      // Delete the image from Cloudinary using the public ID
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
}
router.post('/Login', LogginUser)
router.get('/Logout', protect, LogoutUser)
router.get('/Products/:category', getProductByKeywords)
router.get('/All-images', getAllImages)
router.post('/image', upload.single("image"), ImageUpload)

router.post('/create-product', upload.array("images", 5), createProduct)
router.get('/all-product', getAllProducts)
router.post('/single-product/:id', getOneProduct)
router.patch('/update-product/:id', updateProduct)
router.delete('/delete-product/:id', deleteProduct)
router.get('/get-Transication-id/:OrderId', getTransactionID);
router.post('/create-order', protect, CreateOrder)
router.get('/my-order', protect, orderForMe)
router.get('/admin-order', orderForAdmin)
router.get('/single-order/:id', getSingleOrderById)

router.get('/finduserbyid/:user_id', getUserIdbyUser)
router.get('/getAllCategorey', getAllCategoryWithImagesAndNumberOfProducts)
router.post('/update-order', UpdateOrderStatus)

router.post('/Bannercreate', createBanner);

// Route for getting all banners
router.get('/Bannerall', getllbanner);
router.get('/All-Active-Banner', getAllActiveBanners);

router.get('/search', getProductsByProductNameOrCategory);
// Route for deleting a banner
router.delete('/Bannerdelete/:id', deleteBanner);

// Route for marking a banner as inactive
router.put('/Banner/inactive/:id', markInactiveBanner);
router.put('/Banner/active/:id', toggleBannerActiveStatus);
// Web Page Controllers ROutes = ==============================================
router.post('/Make-categories', makeCategories)
router.get('/get-categories', getAllCategories)
router.post('/delete-categories/:id', deleteCategoryById)

router.post('/Make-tags', makeTags)
router.get('/get-tags', getTags)
router.post('/delete-tags/:id', deleteTags)
router.post('/Make-vouchers', createVouchers)
router.get('/get-vouchers', getVouchers)
router.post('/edit-vouchers', editVoucher)

router.post('/delete-tags/:id', deleteVoucher)




module.exports = router 
