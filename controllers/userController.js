const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Workspace = require("../models/Workspace");

const registerUser = async (req, res, next) => {
     try {
          const { firstName, lastName, email, password } = req.body;
          const userExist = await User.findOne({ email });

          if (userExist) {
               return res.status(400).json({
                    status: false,
                    message: "An account with this email has already been registered.",
               });
          }

          const user = await User.create({
               firstName,
               lastName,
               email,
               password,
          });

          if (user) {
               res.status(200).json({
                    status: true,
                    message: "User registered successfully",
               });
          } else {
               next("An account with this email has already been registered.");
          }
     } catch (error) {
          next(error);
     }
};

const loginUser = async (req, res, next) => {
     try {
          const { email, password } = req.body;
          const user = await User.findOne({ email });

          if (!user) {
               return res.status(400).json({
                    status: false,
                    message: "Invalid Email Address",
               });
          }

          if (!user?.isActive) {
               return res.status(400).json({
                    status: false,
                    message: "User account has been deactivated, contact the administrator",
               });
          }

          const isMatch = await user.matchPassword(password);

          if (isMatch) {
               const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
                    expiresIn: "1d",
               });

               user.password = null;

               return res.status(200).json({
                    status: true,
                    message: "User login successfully",
                    user: user,
                    token: token,
               });
          } else {
               return res.status(400).json({
                    status: false,
                    message: "Invalid Password or Email",
               });
          }
     } catch (error) {
          next(error);
     }
};

const getUserList = async (req, res, next) => {
     try {
          const { workspaceID } = req.query;
         
          if (workspaceID) {
               const workspace = await Workspace.findOne({ _id: workspaceID })
                    .populate({
                         path: "users author",
                         select: "firstName lastName email",
                    })
                    .exec();

               if( workspace ){
                    const megerData = [...workspace.users, workspace.author];
                    res.status(200).json({
                         status: true,
                         message: "User List fetch successfully",
                         users: megerData,
                    });
               }    
               else{
                    next('Workspace not found');
               }  
          } else {
               const users = await User.find().exec();

               res.status(200).json({
                    status: true,
                    message: "User List fetch successfully",
                    users: users ? users : [],
               });
          }
     } catch (error) {
          next(error);
     }
};

const getAllUserList = async (req, res, next) => {
     try {
          const users = await User.find().sort({ createdAt: -1 }).exec();

          res.status(200).json({
               status: true,
               message: "User List fetch successfully",
               users: users ? users : [],
          });
     } catch (error) {
          next(error);
     }
};

const generateRandom = async (req, res, next) => {
     try {
          const response = await fetch("https://randomuser.me/api/?inc=name,email&nat=in&gender=female");

          if (response.ok) {
               const data = await response.json();
               res.status(200).json({
                    status: true,
                    message: "User List fetch successfully",
                    user: data.results[0],
               });
          }
     } catch (error) {
          console.log(error);
          next(error);
     }
};

module.exports = { registerUser, loginUser, getUserList, getAllUserList, generateRandom };