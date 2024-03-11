const merchantid = "M22TZ2UNQ5ROH"
const apikey = "df572d55-be5c-458a-9716-62eacfb5493a"
const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/PaymentModal')
const user = require('../models/user.model')
const Order = require('../models/order.model')
const jwt = require('jsonwebtoken')
exports.newPayment = async (req, res) => {
    try {
        console.log("i am hit")
        const userId = req.user ? req.user.id : null;
        const checkUserPresent = await user.findById(userId);

        if (!checkUserPresent) {
            return res.status(400).json({ success: false, message: "User ID not available" });
        }

        const { amount, Merchenat } = req.body;
        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchantid,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: Merchenat,
            name: checkUserPresent.Name || "User",
            amount: amount * 100,
            redirectUrl: `https://motion-63l4.onrender.com/api/v2/status/${merchantTransactionId}?token=${req.headers.authorization.split(" ")[1]}`,
            redirectMode: 'POST',
            mobileNumber: checkUserPresent.Number || "123456789",
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + apikey;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);
        console.log(response.data);

        // Responding with success and the response data
        res.status(200).json({
            success: true,
            paydata: response.data // Assuming you want to send back the response from PhonePe API
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        });
    }
}
exports.checkStatus = async (req, res) => {
    // Extract token from URL query parameters
    const token = req.query.token;
    console.log(token)
    // Decode token to get user ID
    let userId;
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            userId = decodedToken.id;
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } else {
        return res.status(400).json({ success: false, message: "Token not provided" });
    }

    // Log the user information (for debugging)
    console.log("User ID:", userId);

    // Extract the merchantTransactionId from the request body
    const { transactionId: merchantTransactionId } = req.body;

    // Check if the merchantTransactionId is available
    if (!merchantTransactionId) {
        return res.status(400).json({ success: false, message: "Merchant transaction ID not provided" });
    }

    // Retrieve the merchant ID from the environment variables or constants
    const merchantId = merchantid;

    // Generate the checksum for authentication
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + apikey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    // Prepare the options for the HTTP request
    const options = {
        method: 'GET',
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    // Send the HTTP request to check the payment status
    axios.request(options)
        .then(async (response) => {
            // Check if the payment was successful
            if (response.data.success === true) {
                // Check if the user ID is available
                if (!userId) {
                    return res.status(400).json({ success: false, message: "User ID not available" });
                }

                // Fetch the most recent order associated with the user within a certain timestamp range
                const timestampThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Example: Orders within the last 24 hours
                const userOrders = await Order.find({ user: userId, createdAt: { $gt: timestampThreshold } })
                    .sort({ createdAt: -1 })
                    .limit(1);

                // Check if any orders are found
                if (!userOrders || userOrders.length === 0) {
                    return res.status(404).json({ success: false, message: "No recent orders found for the user" });
                }

                // Create a new payment entry in the database
                const newPayment = new Payment({
                    user: userId,
                    order: userOrders[0]._id, // Assuming you want to associate the payment with the most recent order
                    tranxTionId: merchantTransactionId // Assign the merchantTransactionId to the transaction ID field
                });

                // Save the new payment entry to the database
                await newPayment.save();

                // Redirect the user to the success page
                const successRedirectUrl = `${process.env.FRONTEND_URL}/paymentsuccess/${merchantTransactionId}/success`;
                return res.redirect(successRedirectUrl);
            } else {
                // Redirect the user to the failed payment page
                const failedRedirectUrl = `${process.env.FRONTEND_URL}/paymentsuccess/Failed`;
                return res.redirect(failedRedirectUrl);
            }
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        });
};
