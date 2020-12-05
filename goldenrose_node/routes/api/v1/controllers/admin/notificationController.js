const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const redis = require('redis');
var client = redis.createClient();

// Model

const Admin = require('../../../../../db/models/admin');
const User = require('../../../../../db/models/user');
const Notification = require('../../../../../db/models/notification');
const CustomNotification = require('../../../../../db/models/customnotification');
const Coupon = require('../../../../../db/models/coupon');

// Middleware

const verifyAdmin = require('../../middlewares/verifyAdmin');

// Utils

const sendgrid = require('../../../../../utils/sendgrid');
const { getSocket } = require("../../../../../core/socket/server");

const date = new Date();
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

router.post('/send', verifyAdmin, async (req, res) => {

    try {
        let custom_notification_id = null;
        let validator = new Validator(req.body, {
            title: 'required',
            message: 'required',
            type: 'required',
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

        let { title, message, to, type, user_list,user_type } = req.body;
        let admin = await Admin.findOne({ email: req.email });
        if (admin) {
            let cus_notification = new CustomNotification({
                to: to,
                message,
                title,
                user_type,
                type,
                user_list,
            });
            let doc = await cus_notification.save();
            custom_notification_id = doc._id;

            if (type === 'PUSH') {
                if (user_type == 'CUSTOM-USER' && user_list.length > 0) {
                    for (let data of user_list) {
                        let user = await User.findOne({ email: data });
                        if (req.body.coupon) {
                            let coupon = await Coupon.findOne({ _id: req.body.coupon });
                            const date = new Date();

                            var validdate = date.setDate(date.getDate() + coupon.validitydays);

                            let usercpn = {
                                title: coupon.title,
                                couponcode: coupon.couponcode,
                                validitydays: validdate,
                                percentage: coupon.percentage,
                                description: coupon.description
                            };

                            user.coupon.push(usercpn);
                            let val = await user.save();

                            let notification = await new Notification({
                                user_id: user._id,
                                email: user.email,
                                message,
                                title,
                                custom_notification_id
                            }).save();

                            let data = await User.findOne({ _id: user._id });

                            if (data) {
                                let push_data = {
                                    title,
                                    message
                                }        
                                await client.hgetall(user.email, function (err, result) {
                                    if (result) {
                                        getSocket.to(result.socketId).emit("pushNotification", push_data);
                                    }
                                });
                            }

                        } else if (!req.body.coupon) {

                            let data = await User.findOne({ _id: user._id });

                            let notification = await new Notification({
                                user_id: user._id,
                                email: user.email,
                                message,
                                title,
                                custom_notification_id
                            }).save();

                            if (data) {
                                let push_data = {
                                    title,
                                    message
                                }        
                                await client.hgetall(user.email, function (err, result) {
                                    if (result) {
                                        getSocket.to(result.socketId).emit("pushNotification", push_data);
                                    }
                                });
                            }
                        }
                    }
                } else if (user_type == 'ALL') {
                    let List_User = await User.find();
                    for (let user of List_User) {
                        if (req.body.coupon) {
                            let coupon = await Coupon.findOne({ _id: req.body.coupon });
                            const date = new Date();

                            var validdate = date.setDate(date.getDate() + coupon.validitydays);

                            let usercpn = {
                                title: coupon.title,
                                couponcode: coupon.couponcode,
                                validitydays: validdate,
                                percentage: coupon.percentage,
                                description: coupon.description
                            };

                            user.coupon.push(usercpn);
                            let val = await user.save();

                            let notification = await new Notification({
                                user_id: user._id,
                                email: user.email,
                                message,
                                title,
                                custom_notification_id
                            }).save();

                            let data = await User.findOne({ _id: user._id });

                            if (data) {
                                let push_data = {
                                    title,
                                    message
                                }        
                                await client.hgetall(user.email, function (err, result) {
                                    if (result) {
                                        getSocket.to(result.socketId).emit("pushNotification", push_data);
                                    }
                                });
                            }

                        } else if (!req.body.coupon) {

                            let data = await User.findOne({ _id: user._id });

                            let notification = await new Notification({
                                user_id: user._id,
                                email: user.email,
                                message,
                                title,
                                custom_notification_id
                            }).save();


                            if (data) {
                                let push_data = {
                                    title,
                                    message
                                }        
                                await client.hgetall(user.email, function (err, result) {
                                    if (result) {
                                        getSocket.to(result.socketId).emit("pushNotification", push_data);
                                    }
                                });
                            }
                        }
                    }
                } else {
                    return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again !' });
                }
            }

            if (type === 'MAIL') {
                let i = 0;
                if (user_type == 'CUSTOM-USER' && user_list.length > 0) {
                    let email_array = [];
                    for (let data of user_list) {
                        i++;
                        let user = await User.findOne({ email: data });
                        if (req.body.coupon) {
                            let coupon = await Coupon.findOne({ _id: req.body.coupon });
                            const date = new Date();

                            var validdate = date.setDate(date.getDate() + coupon.validitydays);


                            let usercpn = {
                                title: coupon.title,
                                couponcode: coupon.couponcode,
                                validitydays: validdate,
                                percentage: coupon.percentage,
                                description: coupon.description
                            };

                            user.coupon.push(usercpn);

                            var day = date.toLocaleDateString();
                            let val = await user.save();
                            email_array.push(user.email);
                            let replacements = {
                                percentage: coupon.percentage,
                                validdate: day,
                                couponcode: coupon.couponcode,
                                emailImages: process.env.email_images,
                            };

                            let send = await sendgrid.sendMail(email_array,process.env.from_email, process.env.coupon_code_template, replacements);
                        } else if (!req.body.coupon) {
                            email_array.push(user.email);
                            let replacements = {
                                username: user.user_name,
                                title: title,
                                message: message,
                                emailImages: process.env.email_images,
                            };
                            let send = await sendgrid.sendMail(email_array,process.env.from_email, process.env.custom_notification_template, replacements);
                            if (send) {
                                return res.status(200).json({ success: true, message: 'Email Notification Send successfully.' });
                            } else {
                                return res.status(400).json({ success: false, message: 'Email Notification Send Failed.' });
                            }

                        }else{
                            return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !' });

                        }
                    }
                }else if (user_type == 'ALL') {
                    let email_array = [];
                    let List_User = await User.find();
                    for (let user of List_User) {
                        i++;
                        if (req.body.coupon) {
                            let coupon = await Coupon.findOne({ _id: req.body.coupon });
                            const date = new Date();

                            var validdate = date.setDate(date.getDate() + coupon.validitydays);


                            let usercpn = {
                                title: coupon.title,
                                couponcode: coupon.couponcode,
                                validitydays: validdate,
                                percentage: coupon.percentage,
                                description: coupon.description
                            };

                            user.coupon.push(usercpn);

                            var day = date.toLocaleDateString();
                            let val = await user.save();
                            email_array.push(user.email);
                            let replacements = {
                                percentage: coupon.percentage,
                                validdate: day,
                                couponcode: coupon.couponcode,
                                emailImages: process.env.email_images,
                            };

                            let send = await sendgrid.sendMail(email_array,process.env.from_email, process.env.coupon_code_template, replacements);
                        } else if (!req.body.coupon) {
                            email_array.push(user.email);
                            let replacements = {
                                username: user.user_name,
                                title: title,
                                message: message,
                                emailImages: process.env.email_images,
                            };
                            let send = await sendgrid.sendMail(email_array,process.env.from_email, process.env.custom_notification_template, replacements);
                            if (send) {
                                return res.status(200).json({ success: true, message: 'Email Notification Send successfully.' });
                            } else {
                                return res.status(400).json({ success: false, message: 'Email Notification Send Failed.' });
                            }

                        }else{
                            return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !' });
                        }
                    }
                } 
            }
            return res.status(200).json({ success: true, message: 'Notification send successfully !' });

        }else{
            return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !' });

        }
        
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


router.get('/list', verifyAdmin, async (req, res) => {

    try {

        let admin = await Admin.findOne({ email: req.email });
        if (admin) {
            let notification = await CustomNotification.find({ deleted: false });
            return res.status(200).json({ success: true, message: 'Notification Fetched successfully !', data: notification });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to fetch Notification !' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/delete', verifyAdmin, async (req, res) => {

    try {

        let admin = await Admin.findOne({ email: req.email });
        if (admin) {
            let notification = await CustomNotification.findOne({ _id: req.query.id, deleted: false });
            if (notification) {
                notification.deleted = true;
                await notification.save();
                return res.status(200).json({ success: true, message: 'Notification deleted successfully !' });
            }else{
                return res.status(404).json({ success: false, message: 'Notification Not Found !' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Failed to delete Notification !' });
        }

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);
        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});