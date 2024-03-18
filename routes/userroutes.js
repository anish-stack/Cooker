const express = require('express')
const { RegisterUser, LogginUser, LogoutUser,getUserIdbyUser,createContact,getContacts,getAllUser ,changePassword  } = require('../controllers/usercontroller')
const { createProduct, getAllProducts, getOneProduct, updateProduct, deleteProduct, getProductByKeywords, getAllCategoryWithImagesAndNumberOfProducts, getProductsByProductNameOrCategory } = require('../controllers/productController')
const { protect } = require('../middleware/authmiddlleware')
const { CreateOrder, orderForMe, orderForAdmin, UpdateOrderStatus, getTransactionID } = require('../controllers/orderController')
const { createBanner, getllbanner, deleteBanner, markInactiveBanner, getAllActiveBanners, toggleBannerActiveStatus } = require('../controllers/WebpageController')
const router  =express.Router()


router.post('/Register',RegisterUser)
router.post('/changePassword',protect,changePassword)

router.post('/Contact',createContact )
router.get('/getContact',getContacts )
router.get('/getAllUser',getAllUser )




router.post('/Login',LogginUser)
router.get('/Logout',protect,LogoutUser)
router.get('/Products/:category',getProductByKeywords)


router.post('/create-product',createProduct)
router.get('/all-product',getAllProducts)
router.post('/single-product/:id',getOneProduct)
router.patch('/update-product/:id',updateProduct)
router.delete('/delete-product/:id',protect,deleteProduct)
router.get('/get-Transication-id/:OrderId',getTransactionID);   
router.post('/create-order',protect,CreateOrder)
router.get('/my-order',protect,orderForMe)
router.get('/admin-order',protect,orderForAdmin)
router.get('/finduserbyid/:user_id',getUserIdbyUser)
router.get('/getAllCategorey',getAllCategoryWithImagesAndNumberOfProducts)
router.post('/update-order',UpdateOrderStatus)

router.post('/Bannercreate',createBanner);

// Route for getting all banners
router.get('/Bannerall',getllbanner);
router.get('/All-Active-Banner',getAllActiveBanners);

router.get('/search', getProductsByProductNameOrCategory);
// Route for deleting a banner
router.delete('/Bannerdelete/:id',deleteBanner);

// Route for marking a banner as inactive
router.put('/Banner/inactive/:id',markInactiveBanner);
router.put('/Banner/active/:id',toggleBannerActiveStatus);



module.exports=router 
