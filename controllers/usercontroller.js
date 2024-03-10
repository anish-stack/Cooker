//imports
const User = require("../models/user.model");
const sendEmail = require("../utils/sendMail");
const sendToken = require("../utils/SendToken")
const Contact = require("../models/contactModel");
const bcrypt = require('bcrypt');

// ... Other imports and controller functions ...

// Change Password
// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword, id } = req.body;
    const userId = id; // Assuming you have user information stored in req.user

    // Validate if no empty field
    const emptyFields = [];

    if (!oldPassword) {
      emptyFields.push('Old Password');
    }

    if (!newPassword) {
      emptyFields.push('New Password');
    }

    if (!confirmPassword) {
      emptyFields.push('Confirm Password');
    }

    if (emptyFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following fields are required: ${emptyFields.join(', ')}`,
      });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New Password and Confirm Password do not match',
      });
    }

    // Check if the provided old password matches the current password in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isPasswordMatch = await user.comparePassword(oldPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old Password is incorrect',
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.Password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error during password change:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


exports.createContact = async (req, res) => {
  try {
    const { Name, Email, PhoneNumber, Message } = req.body;

    // Validate request data (you might want to add more validation)
    if (!Name || !Email || !PhoneNumber || !Message) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const newContact = new Contact({
      Name,
      Email,
      PhoneNumber,
      Message,
    });

    // Save the new contact to the database
    await newContact.save();

    res.status(201).json({ message: 'Contact created successfully.' });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error retrieving contacts:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
exports.getAllUser = async (req, res) => {
  try {
    const Users = await User.find();
    res.status(200).json(Users);
  } catch (error) {
    console.error('Error retrieving Users:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
// Register
exports.RegisterUser = async (req, res) => {
  try {
    console.log(req.body)
    const { Name, Email, Password, ContactNumber, Role } = req.body;

    // Validate if no any empty field

    const emptyFields = [];

    if (!Name) {
      emptyFields.push('Name');
    }
    
    if (!Email) {
      emptyFields.push('Email');
    }
    
    if (!ContactNumber) {
      emptyFields.push('Number');
    }
    
    if (!Password) {
      emptyFields.push('Password');
    }
    

    
    if (emptyFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following fields are required: ${emptyFields.join(', ')}`,
      });
    }

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ Email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered',
      });
    }
   const existingUserByContactNumber = await User.findOne({ ContactNumber });
    if (existingUserByContactNumber) {
      return res.status(409).json({
        success: false,
        message: 'Contact number is already registered',
      });
    }
    // Save a new user
    const newUser = new User({
      Name,
      Email,
      Password,
      ContactNumber,
      Role,
    });

    const emailOptions = {
      email: Email,
      subject: 'Welcome To Ecommerce Project',
      message: `Congratulations Buddy ${Name}`,
    };
    


    // Save the new user to the database
    await newUser.save();
    // Send welcome email
    await sendEmail(emailOptions);
    return res.status(200).json({
      success: true,
      data: newUser,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};


//Login 
exports.LogginUser = async (req,res) =>{
    try {
        
        const {Email , Password} = req.body

        if(!Email || !Password){
            return res.status(403).json({
                success: false,
                message: "Please enter all fields"
            })
        }
      const checkUser = await User.findOne({Email})

      if(!checkUser){
        return res.status(401).json({
            success: false,
            message: "User Not Found"
        })
    }

    const PasswordMatch = await checkUser.comparePassword(Password)
    if (!PasswordMatch) {
      return res.status(401).json({
        succes:false,
        message:"Invalid Password"
      })
    }   
    
    await sendToken(checkUser, res, 200);
    } catch (error) {
        console.log(error)
    }
}


//Logout

exports.LogoutUser = async (req,res) =>{
  //clear cookie
  try {
    res.cookie('Token')
    // console.log('LogoutUser')

    return res.status(200).json({
      success: true,
      message:'Logged out'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:'Internal Server Error'
    })
  }
}


exports.getUserIdbyUser = async(req,res)=>{
  try{
    let userid= req.params.user_id;
    let UserInfo = await User.findById(userid,-"password");
    if(!UserInfo){
      return res.status(403).json({
        success: false,
        msg: 'user is not found'
      })
    }
    
   

    return res.status(200).json({
      success: true,
      msg: 'user is found',
      data : UserInfo
    })


  }
  catch(error){
    console.log(error)
  }
}
