// import mongoose
const mongoose = require('mongoose');

// Define the MongoDB connection URL. Replace 'your-database-uri' with your actual MongoDB URI.
const dbURI = process.env.MONGOURL;


// // Define a function to connect to the database
 const ConnectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

module.exports= ConnectDB