const Banner = require('../models/Banners.model')

exports.createBanner = async(req,res)=>{
    try {
        const {title,image,active} = req.body
        if(!title || !image){
            return res.status(400).json({msg:"Please fill out all fields"})
        }
        const newBanner = new  Banner ({
            title: title,
            image: image,
            active : active ? true : false
        })
        await newBanner.save()
        res.status(201).json({
            success:true,
            data:newBanner,
            msg:"Banner Created SuccessFull"
        })

    } catch (error) {
        console.log(error)
    }
}

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
  };
  