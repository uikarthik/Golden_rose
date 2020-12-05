const jwt = require('jsonwebtoken');
const User = require('../../../../db/models/user');
const redis = require('redis');
var client = redis.createClient();
const Guest = require('../../../../db/models/guest');
var crypto = require("crypto");
var randomstring = require("randomstring");

async function verifyUser(req, res, next) {

    var session_jwt = req.session.jwt;
    // var sessionToken = req.session.sessionToken;
    var sessionToken = req.headers['sessionid'];

    var sessionIp = req.session.ip;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var token = req.headers['x-access-token'] || req.headers['authorization'];

    // if (!token || session_jwt !== token || !sessionToken || ip !== sessionIp) {
    //     return res.status(401).json({ success: false, message: 'Unauthorized access' });
    // }
 
    jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
   
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }
        req.email = decoded.email;

        client.get(decoded.email, function(error, result) {
            if (error) {
                return res.status(401).json({ success: false, message: 'Unauthorized access' });
            }
        });

        let user = await User.findOne({ email: req.email });
    
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }
        if (!user.status) {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        
        let guest = await Guest.findOne({ session_token: sessionToken });
    
        if(guest){
            req.session_token =  guest.session_token;
            req.ip =  ip;
            req.session_ip =  req.session.ip;
            req.user_name =  guest.user_name;
        }else{

            let time = 86400000;
            // req.session.sessionToken = crypto.randomBytes(16).toString("base64");
            req.session.sessionToken = req.headers['sessionid'];
            req.session.ip =
                req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            req.session.cookie.expires = new Date(Date.now() + time);
            req.session.cookie.maxAge = time;

            let new_guest = await new Guest({
                user_name:"GUEST-"+randomstring.generate(8).toUpperCase(),
                ip_address:req.session.ip,
                session_token:req.session.sessionToken,
                session_expiry:req.session.cookie.expires,
            }).save();
            req.session_token =  new_guest.session_token;
            req.ip =  ip;
            req.session_ip =  new_guest.ip_address;
            req.user_name =  new_guest.user_name;
        }

        next();
    });
}

module.exports = verifyUser;