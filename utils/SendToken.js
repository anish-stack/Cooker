const jwt = require('jsonwebtoken');

const sendToken = async (user, res, StatusCode) => {
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });

    const options = {
      path: "/",
      expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: false,
   
    };

    // Set the 'token' cookie with the token value and options
    res.cookie('token', token, options);

    res.status(StatusCode).json({
      success: true,
      login: user,
      token: token, // Return the token in the response
    });
  } catch (error) {
    console.log("Error in generating token:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = sendToken;
