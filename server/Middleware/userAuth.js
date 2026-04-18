import jwt from "jsonwebtoken";
import userModel from "../Model/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    // Check for either token or tempToken
    const token = req.cookies.token || req.cookies.tempToken;
    
    if (!token) {
      return res.json({ success: false, message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // If using tempToken, only allow verification endpoints
    if (req.cookies.tempToken && !req.path.includes('/verify-account') && !req.path.includes('/send-verify-otp')) {
      return res.json({ success: false, message: "Please verify your login first" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    return res.json({ success: false, message: "Authentication failed" });
  }
};

export default userAuth;
