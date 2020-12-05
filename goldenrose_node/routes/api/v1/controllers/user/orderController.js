const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
var randomstring = require("randomstring");

// Model

const User = require('../../../../../db/models/user');
const Order = require('../../../../../db/models/order');
const Product = require('../../../../../db/models/product');
const LogFile = require('../../../../../core/log/index');
const Card = require('../../../../../db/models/card');
const Settings = require('../../../../../db/models/settings');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');
const Stripe = require('../../../../../core/stripe/index');
const sendgrid = require('../../../../../utils/sendgrid');


const formatDate=(dateObj)=>{
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const dateOrdinal=(dom)=> {
    if (dom == 31 || dom == 21 || dom == 1) return dom + "st";
    else if (dom == 22 || dom == 2) return dom + "nd";
    else if (dom == 23 || dom == 3) return dom + "rd";
    else return dom + "th";
};
return dateOrdinal(dateObj.getDate())+', '+days[dateObj.getDay()]+' '+ months[dateObj.getMonth()]+', '+dateObj.getFullYear();
}


module.exports = router;

router.get('/list', verifyUser, async (req, res) => {
    try {

        let limit = 10;

        var user = await User.findOne({ email: req.email });
        if (user) {

            if (req.query.limit) {
                limit = req.query.limit
            }

            // var orders = await Order.find({ user_id: user._id, deleted: false }).sort({ _id: -1 }).limit(limit).sort({ createdAt: -1 });
            var orders = await Order.find({ user_id: user._id, deleted: false }).sort({ createdAt: -1 });

            if (req.query.id) {
                orders = await Order.find({ user_id: user._id, _id: { $lt: req.query.id }, deleted: false }).sort({ _id: -1 }).limit(limit).sort({ createdAt: -1 });
            }

            return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'order_listed'), data: orders });
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/details', async (req, res) => {
    try {
        

        var orders = await Order.findOne({ _id: req.query.id, deleted: false }).populate({
            path: "product",
            populate: {path:"product_id"},
        });


        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'order_listed'), data: orders });
        

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.post('/create', verifyUser, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            address_id: 'required',
            card_id: 'required',
            delivery_type:'required'
        });

        let { address_id, coupon_code, card_id, delivery_type} = req.body;
        let address;
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

        var user = await User.findOne({ email: req.email });
        if (user) {

            if (user.cart.length == 0) {
                return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'empty_cart') });
            }

            let exid = 0;

            let getid = await Order.findOne().sort({ _id: -1 }).limit(1);

            if (getid) {
                exid = getid.order_id + 1;
            } else {
                exid += 1;
            }

            let amount = 0;
            let delivery_fee = 0;
            let quantity = 0;
            let temp;
            let product = [];
            let coupon_valid = false;
            let coupon_details;
            let coupon_offer = 0;
            let amount_paid = 0;
            let order_id = exid;
            let tx_id = 'OD' + randomstring.generate(8).toUpperCase() + order_id;

            // Cart items

            for (item of user.cart) {
                let product_details = await Product.findOne({ _id: item.product_id });
                if (product_details) {

                    if(product_details.stock_count[item.price_id] >= item.quantity && product_details.stock_available == true){
                        amount += product_details.available_price[item.price_id] * item.quantity;
                        quantity += item.quantity;
                        temp = {
                            product_id: item.product_id,
                            quantity: item.quantity,
                            total_price: product_details.price[item.price_id],
                            available_price: product_details.available_price[item.price_id] * item.quantity,
                            offer_percentage: product_details.offer_percentage,
                            price_per_qty: product_details.available_price[item.price_id],
                            price_id:item.price_id,
                        }
                        await product.push(temp);
                    }else{
                        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'stock_not_available') });
                    }

                }
            }

            // Coupon Validity

            if (coupon_code) {
                for (coupon of user.coupon) {
                    if (coupon.validitydays > Date.now() && coupon.couponcode == coupon_code && coupon.couponused == false) {
                        coupon_valid = true;
                        coupon_details = coupon;
                        coupon.couponused = true;
                    }
                }
            }

            let setting = await Settings.findOne({ type: 'SITE' });
            if (setting) {
                if(amount > setting.order_price){
                    if(delivery_type == 'NORMAL'){
                        delivery_fee = setting.delivery_fee_above_min;
                    }else{
                        delivery_fee = setting.delivery_fee_above_max;
                    }
                }else{
                    if(delivery_type == 'NORMAL'){
                        delivery_fee = setting.delivery_fee_below_min;
                    }else{
                        delivery_fee = setting.delivery_fee_below_max;
                    }
                }
                amount = amount + delivery_fee;
            }

            amount_paid = amount;

            if (coupon_valid == true) {
                let per = coupon_details.percentage;
                coupon_offer = (amount / 100) * per;
                amount_paid = amount - coupon_offer.toFixed(2);
            }


            for(add of user.address){
                if(add._id.toString() == address_id.toString()){
                    address = add;
                }
            }

            // Payment Code

            var cards = await Card.findOne({ user_id: user._id, _id: card_id, deleted: false });
            if (cards) {

                let addMoney = await Stripe.addMoney(amount_paid, 'eur', cards.customer_id, cards.card_id, 'Payment for Order id : ' + tx_id + ' !')
                if (addMoney == null) {
                    return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'addmoney_failed') });
                }

                let new_order = await new Order({
                    order_id: order_id,
                    tx_id: tx_id,
                    user_id: user._id,
                    email: user.email,
                    address: address,
                    quantity: quantity,
                    order_status: 'ORDERED',
                    ordered_date: Date.now(),
                    amount: amount,
                    amount_paid: amount_paid,
                    product: product,
                    coupon_offer: coupon_offer,
                    coupon_used: coupon_code,
                    payment_status: 1,
                    status: 1,
                    delivery_fee: delivery_fee,
                    delivery_type:delivery_type,
                    paid_through: '**** **** **** ' + cards.number,
                }).save();
                user.cart=[];
                await user.save();

                let email_array = [];
                email_array.push(user.email);
                let arriving_date;

                
                
                let fromdate;
                let todate;

                if(delivery_type == 'NORMAL'){

                    var ds = new Date(),
                    hour = ds.getHours(),
                    min = ds.getMinutes(),
                    month = ds.getMonth(),
                    year = ds.getFullYear(),
                    sec = ds.getSeconds(),
                    day = ds.getDate()+3;

                    fromdate = new Date(year, month, day);

                    var ds = new Date(),
                    hour = ds.getHours(),
                    min = ds.getMinutes(),
                    month = ds.getMonth(),
                    year = ds.getFullYear(),
                    sec = ds.getSeconds(),
                    day = ds.getDate()+5;

                    todate = new Date(year, month, day);

                }else{

                    var ds = new Date(),
                    hour = ds.getHours(),
                    min = ds.getMinutes(),
                    month = ds.getMonth(),
                    year = ds.getFullYear(),
                    sec = ds.getSeconds(),
                    day = ds.getDate()+1;

                    fromdate = new Date(year, month, day);

                    var ds = new Date(),
                    hour = ds.getHours(),
                    min = ds.getMinutes(),
                    month = ds.getMonth(),
                    year = ds.getFullYear(),
                    sec = ds.getSeconds(),
                    day = ds.getDate()+2;

                    todate = new Date(year, month, day);

                }

                let replacements = {
                    todate:formatDate(todate),
                    fromdate:formatDate(fromdate),
                    order_id: tx_id,
                    arriving_date: arriving_date,
                    address: address.address+','+address.city+','+address.state+','+address.locality+'-'+address.pincode+','+address.landmark,
                    username:user.user_name,
                    redirectUrl: process.env.home_url + "/orderview/" + new_order._id
                };

                let send = await sendgrid.sendMail(email_array,process.env.order_email,process.env.order_confirmation_template, replacements);

                for (pro of product) {
                    let product_counts = await Product.findOne({ _id: pro.product_id });
                    if (product_counts) {
                        product_counts.stock_count[pro.price_id] -= pro.quantity;
                        if(product_counts.stock_count[pro.price_id] <= 0){
                            product_counts.stock_available = false;
                        }
                        await product_counts.save();
                    }
                }

                return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'ordered_success'), data: new_order });

            } else {
                return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'card_not_found') });
            }
        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });

        }
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/applycoupon', verifyUser, async (req, res) => {
    try {

        let coupon_code = req.query.coupon_code;
        let coupon_valid = false;
        let coupon_details;

        var user = await User.findOne({ email: req.email });
        if (user) {

            if (coupon_code) {
                for (coupon of user.coupon) {
                    if (coupon.validitydays > Date.now() && coupon.couponcode == coupon_code && coupon.couponused == false) {
                        coupon_valid = true;
                        coupon_details = coupon;
                    }
                }
            }

            if(coupon_valid == true){
                return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'coupon_applied'), data: coupon_details });
            }else{
                return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'invalid_coupon') });

            }

        } else {

            return res.status(404).json({ success: false, message: await Language.getResponse(req.session.language, 'user_not_found') });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

