const express = require('express')
const Paymentrouter  =express.Router()
const  {newPayment, checkStatus} = require('../controllers/Paymentcontroller')
const { protect } = require('../middleware/authmiddlleware')


Paymentrouter.post('/payment-create',protect,newPayment)
Paymentrouter.post('/status/:txnId',checkStatus)


module.exports=Paymentrouter