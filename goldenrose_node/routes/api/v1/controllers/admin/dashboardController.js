const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');

const redis = require('redis');
var client = redis.createClient();

// Model

const Admin = require('../../../../../db/models/admin');
const User = require('../../../../../db/models/user');
const Order = require('../../../../../db/models/order');
const Product = require('../../../../../db/models/product');

// Middleware

const verifyAdmin = require('../../middlewares/verifyAdmin');

// Utils

const sendgrid = require('../../../../../utils/sendgrid');
const { getSocket } = require("../../../../../core/socket/server");
const Stripe = require('../../../../../core/stripe/index');

const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

router.get('/', verifyAdmin, async (req, res) => {
    try {

    	let user_count = await User.countDocuments({deleted:false});
        let product_count = await Product.countDocuments({deleted:false});
    	let order_count = await Order.countDocuments({deleted:false});
    	let recent_order = await Order.find({deleted:false}).sort({ _id: -1 }).limit(10).sort({ createdAt: -1 });
        let earnings = await Order.aggregate([{
                    $match: {
                        "deleted": false
                    }
                },
                {
                    $group: {
                        _id: {},
                        count: { $sum: 1 },
                        amount: { $sum: "$amount" },
                        amount_paid: { $sum: "$amount_paid" },
                        countoupon_offer: { $sum: "$coupon_offer" },
                    }
                },
            ]);

        let doc = {
        	user_count,
        	product_count,
        	recent_order,
            order_count,
            earnings
        }
    	
        return res.status(200).json({ success: true, message: 'Dashboard Details', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get("/graph", verifyAdmin, async (req, res) => {
    try {


        let data = [];

        for (var i = 0; i < 31; i++) {

            var ds = new Date(),
                hour = ds.getHours(),
                min = ds.getMinutes(),
                month = ds.getMonth(),
                year = ds.getFullYear(),
                sec = ds.getSeconds(),
                day = 1;

            var date = new Date(year, month, day);

            date.setDate(date.getDate() + i);


            let graph = await Order.aggregate([{
                    $match: {
                        "createdAt": {
                            $gte: new Date(new Date(date).setHours(00, 00, 00)),
                            $lt: new Date(new Date(date).setHours(23, 59, 59))
                        }
                    }
                },
                {
                    $group: {
                        _id: {},
                        count: { $sum: 1 },
                    	amount: { $sum: "$amount" },
                    	amount_paid: { $sum: "$amount_paid" },
                    	countoupon_offer: { $sum: "$coupon_offer" },
                    }
                },
            ]);

            let response;
            if (graph[0]) {
                    response = {
                        date: date,
                        amount: graph[0]
                    }

            }else{
            	response = {
                        date: date,
                        amount: {
			                _id: {},
			                count: 0,
			                amount: 0,
			                amount_paid: 0,
			                countoupon_offer: 0
            			}
            	}
                    
            } 

            await data.push(response);

        }

        await data.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        let finaldata = await data.reverse();


        return res
            .status(200)
            .json({ success: true, message: "Graph Details Fetch Success", data: finaldata });
    } catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "Graph Details Fetch Failed", error: err.message });
    }
});

router.get("/graph/previous", verifyAdmin, async (req, res) => {
    try {


        let data = [];

        for (var i = 0; i < 31; i++) {

            var ds = new Date(),
                hour = ds.getHours(),
                min = ds.getMinutes(),
                month = ds.getMonth()-1,
                year = ds.getFullYear(),
                sec = ds.getSeconds(),
                day = 1;

            var date = new Date(year, month, day);

            date.setDate(date.getDate() + i);


            let graph = await Order.aggregate([{
                    $match: {
                        "createdAt": {
                            $gte: new Date(new Date(date).setHours(00, 00, 00)),
                            $lt: new Date(new Date(date).setHours(23, 59, 59))
                        }
                    }
                },
                {
                    $group: {
                        _id: {},
                        count: { $sum: 1 },
                    	amount: { $sum: "$amount" },
                    	amount_paid: { $sum: "$amount_paid" },
                    	countoupon_offer: { $sum: "$coupon_offer" },
                    }
                },
            ]);

            let response;
            if (graph[0]) {
                    response = {
                        date: date,
                        amount: graph[0]
                    }

            }else{
            	response = {
                        date: date,
                        amount: {
			                _id: {},
			                count: 0,
			                amount: 0,
			                amount_paid: 0,
			                countoupon_offer: 0
            			}
            	}
                    
            } 

            await data.push(response);

        }

        await data.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        let finaldata = await data.reverse();


        return res
            .status(200)
            .json({ success: true, message: "Graph Details Fetch Success", data: finaldata });
    } catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "Graph Details Fetch Failed", error: err.message });
    }
});

router.get("/statics", verifyAdmin, async (req, res) => {
    try {

    	let ordered_count = await Order.countDocuments({ deleted: false,order_status:'ORDERED'});
    	let packed_count = await Order.countDocuments({ deleted: false,order_status:'PACKED'});
    	let shipped_count = await Order.countDocuments({ deleted: false,order_status:'SHIPPED'});
    	let delivered_count = await Order.countDocuments({ deleted: false,order_status:'DELIVERED'});
    	let cart_count = await User.countDocuments({'cart.0': {$exists: true}});
        
    	let count = {
    		ordered_count,
    		packed_count,
    		shipped_count,
    		delivered_count,
    		cart_count,
    	}

    	let totalcount = ordered_count+packed_count+shipped_count+delivered_count+cart_count;
    	let ordered_percentage = totalcount/ordered_count;
    	let packed_percentage = totalcount/packed_count;
    	let shipped_percentage = totalcount/shipped_count;
    	let delivered_percentage = totalcount/delivered_count;
    	let cart_percentage = totalcount/cart_count;

    	if(ordered_count == 0){
    		ordered_percentage = 0;
    	}
    	if(packed_count == 0){
    		packed_percentage = 0;
    	}
    	if(shipped_count == 0){
    		shipped_percentage = 0;
    	}
    	if(delivered_count == 0){
    		delivered_percentage = 0;
    	}
    	if(cart_count == 0){
    		cart_percentage = 0;
    	}

    	let percentage = {
    		ordered_percentage:ordered_percentage.toFixed(2),
    		packed_percentage:packed_percentage.toFixed(2),
    		shipped_percentage:shipped_percentage.toFixed(2),
    		delivered_percentage:delivered_percentage.toFixed(2),
    		cart_percentage:cart_percentage.toFixed(2),
    	}

    	let doc = {
    		count,
    		percentage
    	}

        return res
            .status(200)
            .json({ success: true, message: "Statistics Details Fetch Success", data: doc });
    } catch (err) {
        return res
            .status(400)
            .json({ success: false, message: "Statistics Details Fetch Failed", error: err.message });
    }
});


