import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Model/userModel.js";
import transporter from "../Config/nodemailer.js";


export const register =  async(req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success:false, message:"Missing details"});
    }

    try {
        const existinguser = await userModel.findOne({email});
        if(existinguser){
            return res.json({success:false, message:"User already exists"});
        }

        const hashpass = await bcrypt.hash(password,10);
        const user = new userModel({
            name,
            email,
            password: hashpass,
            isAccountVerified: true // Set to true by default to skip verification
        });

        await user.save();
        
        // No need to generate verification OTP or send verification email
        
        return res.json({
            success: true, 
            message: "Registration successful. You can now login.",
            requiresVerification: false
        });
    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // Generate new verification OTP for each login
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day
        await user.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Login Verification',
            text: `Hello ${user.name},\n\nPlease use the following OTP to verify your login: ${otp}\n\nThis OTP is valid for 24 hours.\n\nBest regards`
        };
        await transporter.sendMail(mailOptions);

        // Generate temporary token that will be replaced after verification
        const tempToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('tempToken', tempToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        return res.json({
            success: true,
            message: "Please verify your login with the OTP sent to your email",
            requiresVerification: true
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async(req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success:true, message:"Logout Success"});
    } catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export const sendVerifyOtp = async(req, res) => {
    try {
        const userId = req.userId; // Get userId from token (set by middleware)
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if(user.isAccountVerified){
            return res.json({success:false, message:"Account already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your account',
            text: `Your OTP is ${otp}. It is valid for 24 hours.`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true, message:"OTP sent to your email"});

    } catch (error) {
        return res.json({success:false, message:error.message});       
    }
}

export const verifyEmail = async(req, res) => {
    const { otp } = req.body;
    if(!otp){
        return res.json({success:false, message:"OTP required"});
    }

    try {
        const userId = req.userId; // Get userId from token (set by middleware)
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false, message:"User not found"});
        }
        if(user.verifyOtp !== otp || user.verifyOtp === ' '){
            return res.json({success:false, message:"Invalid OTP"});
        }   
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP expired"});
        }

        // Clear OTP
        user.verifyOtp = ' ';
        user.verifyOtpExpireAt = 0;
        
        // For registration, mark account as verified
        if (!user.isAccountVerified) {
            user.isAccountVerified = true;
        }
        
        await user.save();

        // Generate new session token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'}); // Token expires in 1 day
        
        // Clear temp token and set new session token
        res.clearCookie('tempToken');
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.json({
            success: true, 
            message: user.isAccountVerified ? "Login successful" : "Account verified successfully"
        });
        
    } catch (error) {
        return res.json({success:false, message:error.message}); 
    }
}

export const isAuthenticated = async(req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.json({ success: false, message: "Not authenticated" });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(tokenDecode.id);
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true, 
            message: "User is authenticated",
            userData: {
                name: user.name,
                email: user.email,
                userId: user._id,
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (error) {
        return res.json({ success: false, message: "Not authenticated" }); 
    }
}

export const sendResetOtp = async(req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({success:false, message:"Email required"});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Reset your password',
            text: `Your OTP is ${otp}. It is valid for 24 hours.`
        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true, message:"OTP sent to your email"});
    } catch (error) {
        return res.json({success:false, message:error.message}); 
    }
}

export const resetPassword = async(req, res) => {
    const {email, otp, newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false, message:"Email, OTP and new password required"});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message:"User not found"});
        }
        if(user.resetOtp !== otp || user.resetOtp === ' '){
            return res.json({success:false, message:"Invalid OTP"});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP expired"});
        }
        const hashpass = await bcrypt.hash(newPassword, 10);
        user.password = hashpass;
        user.resetOtp = ' ';
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({success:true, message:"Password reset successfully"});
    } catch (error) {
        return res.json({success:false, message:error.message}); 
    }
}