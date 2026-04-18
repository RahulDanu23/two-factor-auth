import userModel from "../Model/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId; // Fixed: directly use req.userId as it's already the ID value

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,                 // ✅ Add this if needed
        userId: user._id,                  // ✅ Needed by frontend
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default getUserData;
