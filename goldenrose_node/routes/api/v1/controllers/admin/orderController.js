const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const multer = require("multer");

//Model

const Order = require('../../../../../db/models/order');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

router.get('/list', verifyAdmin, async (req, res) => {
    try {

    	let doc;
    	if(req.query.order_status){
    		doc = await Order.find({ deleted: false,order_status:req.query.order_status}).sort({ createdAt: -1 });
    	}else{
        	doc = await Order.find({ deleted: false }).sort({ createdAt: -1 });
    	}
        return res.status(200).json({ success: true, message: 'Order List Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/details', verifyAdmin, async (req, res) => {
    try {

        let  doc = await Order.findOne({ _id:req.query.id }).populate({
            path: "product",
            populate: {path:"product_id"},
        });
        
        return res.status(200).json({ success: true, message: 'Order Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


router.post('/status', verifyAdmin, async (req, res) => {
    try {

    	let validator = new Validator(req.body, {
            id: 'required',
            order_status: 'required',
        });

        let match = await validator.check();

        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }
        let {id,order_status}=req.body;
        let status = 0;
        if(order_status == 'ORDERED'){
        	order_status = 'ORDERED'
        	status = 0;
        }else if(order_status == 'PACKED'){
        	order_status = 'PACKED'
        	status = 1;
        }else if(order_status == 'SHIPPED'){
        	order_status = 'SHIPPED'
        	status = 2;
        }else if(order_status == 'DELIVERED'){
        	order_status = 'DELIVERED'
        	status = 3;
        }else if(order_status == 'RETURN'){
        	order_status = 'RETURN'
        	status = 4;
        }else if(order_status == 'RETURNED'){
        	order_status = 'RETURNED'
        	status = 5;
        }else if(order_status == 'CANCELLED'){
        	order_status = 'CANCELLED'
        	status = 6;
        }else{
        	order_status = 'ORDERED'
        	status = 0;
        }
    	let doc = await Order.findOne({ _id:id}).sort({ createdAt: -1 });
    	if(doc){

    		doc.order_status = order_status;
    		doc.status = status;
    		if(order_status == 'PACKED'){
	        	doc.packed_date = Date.now();
	        }else if(order_status == 'SHIPPED'){
	        	doc.shipped_date = Date.now();
	        }else if(order_status == 'DELIVERED'){
	        	doc.delivered_date = Date.now();
	        }else if(order_status == 'RETURN'){
	        	doc.return_date = Date.now();
	        }else if(order_status == 'RETURNED'){
	        	doc.returned_date = Date.now();
	        }else if(order_status == 'CANCELLED'){
	        	doc.cancelled_date = Date.now();
	        }
	        await doc.save();
    		
        	return res.status(200).json({ success: true, message: 'Order status Updated', data: doc });
    	}else{
        	return res.status(404).json({ success: true, message: 'Order Not Found'});
    	}
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


