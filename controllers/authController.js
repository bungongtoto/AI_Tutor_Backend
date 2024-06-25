const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmail } = require("../middleware/verifyEmail");
const asyncHandler = require("express-async-handler");

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        userId: foundUser._id,
        email: foundUser.email,
        roles: foundUser.roles,
      },
    },
    `${process.env.ACCESS_TOKEN_SECRET}`,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email },
    `${process.env.REFRESH_TOKEN_SECRET}`,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing email and roles
  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    `${process.env.REFRESH_TOKEN_SECRET}`,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await User.findOne({ email: decoded.email }).exec();

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser._id,
            email: foundUser.email,
            roles: foundUser.roles,
          },
        },
        `${process.env.ACCESS_TOKEN_SECRET}`,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

// @desc signUp
// @route POST /auth
// @access Public
const signUp = asyncHandler(async (req, res) => {
  const { email, password, roles } = req.body;

  // Confirm Data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm Email
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Invalid Email" });
  }

  // check for duplicates
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Email in Use" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { email, password: hashedPwd }
      : { email, password: hashedPwd, roles };

  // create and store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${email} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc sresetPassword
// @route POST /auth
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Confirm Data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm Email
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Invalid Email" });
  }

  // check for duplicates
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (!duplicate) {
    return res.status(404).json({ message: "No Such User" });
  }

  const user = await User.findById(duplicate._id).exec();

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }


  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  user.password = hashedPwd;

  const updatedUser = await user.save();
  
  if (updatedUser) {
    res.status(201).json({ message: `change password for user:  ${email} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

module.exports = {
  login,
  refresh,
  logout,
  signUp, 
  resetPassword
};
