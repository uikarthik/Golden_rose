const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const escapeStringRegexp = require('escape-string-regexp');

// Model

const Guest = require('../../../../../db/models/guest');
const Product = require('../../../../../db/models/product');
const LogFile = require('../../../../../core/log/index');
const Settings = require('../../../../../db/models/settings');

// Middleware

const verifyGuest = require('../../middlewares/verifyGuest');
const Language = require('../../../../../core/language/index');

module.exports = router;

router.get('/list', verifyGuest, async (req, res) => {
    try {

        let delivery_fee = {
            order_price:0,
            delivery_fee_above_min:0,
            delivery_fee_above_max:0,
            delivery_fee_below_min:0,
            delivery_fee_below_max:0,
        }

        let setting = await Settings.findOne({ type: 'SITE' });
        if (setting) {
            delivery_fee = {
                order_price:setting.order_price,
                delivery_fee_above_min:setting.delivery_fee_above_min,
                delivery_fee_above_max:setting.delivery_fee_above_max,
                delivery_fee_below_min:setting.delivery_fee_below_min,
                delivery_fee_below_max:setting.delivery_fee_below_max,
            }
        }

        let doc = await Guest.findOne({ session_token:req.session_token}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_listed'),data:doc.cart ,delivery_fee:delivery_fee});

    } catch (err) {
        LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
        return res.status(500).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/add', verifyGuest, async (req, res) => {
    try {
        let check = await Guest.findOne({ session_token:req.session_token ,"cart.product_id":req.query.id,"cart.price_id":req.query.price_id});

        if(check){
            await Guest.findOneAndUpdate(
                { session_token:req.session_token ,"cart.product_id":req.query.id},
                {
                    $pull: {
                        cart: {
                            product_id:req.query.id,
                        },
                    },
                }
                );
        }

        await Guest.findOneAndUpdate(
            { session_token:req.session_token },
            {
                $push: {
                    cart: {
                        product_id:req.query.id,
                        price_id:req.query.price_id,
                        quantity:req.query.qty,
                    },
                },
            }
            );

        let doc = await Guest.findOne({ session_token:req.session_token}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });
       
        
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_added'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/remove', verifyGuest, async (req, res) => {
    try {

        await Guest.findOneAndUpdate(
            { session_token:req.session_token },
            {
                $pull: {
                    cart: {
                        product_id:req.query.id,
                    },
                },
            }
            );

        let doc = await Guest.findOne({ session_token:req.session_token}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });
        
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_removed'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/increase', verifyGuest, async (req, res) => {
    try {
        let qty=0;
        let price_id=0;
        let check = await Guest.findOne({ session_token:req.session_token ,"cart.product_id":req.query.id}).select('cart');
        for(data of check.cart){
            if(data.product_id == req.query.id){
                data.quantity += 1;
            }
        }
        await check.save();

        let doc = await Guest.findOne({ session_token:req.session_token}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_increased'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/decrease', verifyGuest, async (req, res) => {
    try {
        let qty=0;
        let price_id=0;
        let check = await Guest.findOne({ session_token:req.session_token ,"cart.product_id":req.query.id}).select('cart');
        for(data of check.cart){
            if(data.product_id == req.query.id){
                data.quantity -= 1;
                qty = data.quantity;
            }
        }
        await check.save();

        if(qty<=0){

            await Guest.findOneAndUpdate(
                { session_token:req.session_token ,"cart.product_id":req.query.id},
                {
                    $pull: {
                        cart: {
                            product_id:req.query.id,
                        },
                    },
                }
                );
            
        }
        
        let doc = await Guest.findOne({ session_token:req.session_token}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_decreased'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});


// router.get('/search', verifyGuest, async (req, res) => {
//     try {

//         let key = req.query.key;

//         let check = await Guest.find({ user_name: new RegExp(key, 'i') });


//         return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_decreased'),data:check });
        

//     } catch (err) {
//         LogFile.addLog('catch', req.user_name, req.originalUrl, err.message);
//         return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
//     }
// });


