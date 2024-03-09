// Import mongoose
const mongoose = require('mongoose');

// Define the contact schema
const contactSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
   
  
  },
  PhoneNumber: {
    type: String,
    required: true,
    
  },
  Message: {
    type: String,
    required: true,
  },
});

// Create the Contact model
const Contact = mongoose.model('Contact', contactSchema);

// Export the model for use in your application
module.exports = Contact;
