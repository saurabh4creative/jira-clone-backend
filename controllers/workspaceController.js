const Project = require("../models/Project");
const Workspace = require("../models/Workspace");

const createWorkspace = async (req, res, next) => {
     try {
          const { name, description, users } = req.body;

          const workspace = await Workspace.create({
               name: name,
               description: description,
               users: users,
               author: req.user.id,
          });

          if (workspace) {
               res.status(200).json({
                    status: true,
                    message: "Workspace created successfully",
               });
          } else {
               res.status(400).json({
                    status: false,
                    message: "Something wrong in workspace creation. Please connect with admin",
               });
          }
     } catch (error) {
          next(error);
     }
};

const getWorkspaceList = async (req, res, next) => {
     try {
          const userId = req.user.id;

          const workspace = await Workspace.find({ $or: [{ users: userId }, { author: userId }] })
               .sort({ createdAt: -1 })
               .populate({
                    path: "users author",
                    select: "firstName lastName email",
               })
               .exec();

          res.status(200).json({
               status: true,
               message: "Workspace list fetched successfully",
               workspaces: workspace,
          });
     } catch (error) {
          next(error);
     }
};

const getWorkspaceDetail = async (req, res, next) => {
     try {
          const userId = req.user.id;
          const workspaceID = req.params.workspaceID;

          if (workspaceID) {
               const workspace = await Workspace.findOne({
                    _id: workspaceID,
                    $or: [{ users: userId }, { author: userId }],
               })
                    .populate({
                         path: "users author",
                         select: "firstName lastName email",
                    })
                    .exec();

               const projects = await Project.find({
                    workspace: workspaceID
               });

               if (workspace) {
                    const workspaceData = {
                         ...workspace._doc,
                         projects: projects.length,
                    };

                    res.status(200).json({
                         status: true,
                         message: "Workspace Detail fetched successfully",
                         workspace: workspaceData,
                    });
               } else {
                    res.status(400).json({
                         status: false,
                         message: "Workpsace not found",
                    });
               }
          } else {
               res.status(400).json({
                    status: false,
                    message: "Workspace ID Missing",
               });
          }
     } catch (error) {
          next(error);
     }
};

const getWorkspaceDetailTab = async (req, res, next) => {
     try {
          const userId = req.user.id;
          const workspaceID = req.params.workspaceID;
          const workspaceTab = req.params.tabKey;
          const validTabs = ["projects", "users", "overview"];

          if (!workspaceID) {
               return res.status(400).json({
                    status: false,
                    message: "Workspace ID is missing",
               });
          }

          if (!workspaceTab) {
               return res.status(400).json({
                    status: false,
                    message: "Tab key is missing",
               });
          }

          if (!validTabs.includes(workspaceTab)) {
               return res.status(404).json({
                    status: false,
                    message: "Invalid tab key",
               });
          }

          if (workspaceTab === "projects") {
               const projects = await Project.find({
                    workspace: workspaceID,
                    $or: [{ users: userId }, { author: userId }],
               })
                    .sort({ createdAt: -1 })
                    .populate("users")
                    .populate("author")
                    .exec();

               return res.status(200).json({
                    status: true,
                    message: "Project list fetched successfully",
                    projects: projects,
               });
          }

          // Handle 'users' and 'overview' tabs if needed
          if (workspaceTab === "users") {
               const workspace = await Workspace.findOne({
                    _id: workspaceID,
                    $or: [{ users: userId }, { author: userId }],
               })
                    .populate({
                         path: "users",
                         select: "firstName lastName email",
                    })
                    .exec();

               if (!workspace) {
                    return res.status(404).json({
                         status: false,
                         message: "Workspace not found",
                    });
               }

               const projectCounts = await Project.aggregate([
                    { $match: { workspace: parseInt(workspaceID) } },
                    { $unwind: "$users" },
                    {
                         $group: {
                              _id: "$users",
                              projectCount: { $sum: 1 },
                         },
                    },
               ]); 

               const projectCountMap = {};

               projectCounts.forEach((pc) => {
                    projectCountMap[pc._id] = pc.projectCount;
               });
 
               const projectAuthorCounts = await Project.aggregate([
                    { $match: { workspace: parseInt(workspaceID) } },
                    { $unwind: "$author" },
                    {
                         $group: {
                              _id: "$author",
                              projectCount: { $sum: 1 },
                         },
                    },
               ]); 

               const authorCountMap = {};
 
               projectAuthorCounts.forEach((pc) => {
                    authorCountMap[pc._id] = pc.projectCount;
               }); 

               const usersWithProjectCounts = workspace.users.map((user) => ({
                    ...user._doc,
                    projects: projectCountMap[user._id] || 0,
                    author  : authorCountMap [user._id]  || 0,
               }));

               return res.status(200).json({
                    status: true,
                    message: "User list fetched successfully",
                    users: usersWithProjectCounts,
               });
          }

          if (workspaceTab === "overview") {
               const workspace = await Workspace.findOne({
                    _id: workspaceID,
                    $or: [{ users: userId }, { author: userId }],
               })
                    .populate({
                         path: "users author",
                         select: "firstName lastName email",
                    })
                    .exec();

               if (!workspace) {
                    return res.status(404).json({
                         status: false,
                         message: "Workspace not found",
                    });
               }

               const projects = await Project.find({
                    workspace: workspaceID,
                    $or: [{ users: userId }, { author: userId }],
               });

               return res.status(200).json({
                    status: true,
                    message: "Workspace overview fetched successfully",
                    workspace: {
                         ...workspace.toObject(),
                         projectsCount: projects.length,
                    },
               });
          }

          res.status(404).json({
               status: false,
               message: "Unhandled tab key",
          });
     } catch (error) {
          next(error);
     }
};

const updateWorkspace = async (req, res, next) => {
     try {
          const workspaceID = req.params.workspaceID;
          const workspace = await Workspace.findOne({ _id: workspaceID });

          if (workspace) {
               const { users } = req.body;

               const update = await Workspace.findOneAndUpdate(
                    { _id: workspaceID },
                    {
                         $addToSet: {
                              users: { $each: users },
                         },
                         $set: {
                              updatedAt: Date.now(),
                         },
                    },
                    { new: true }
               );

               res.status(200).json({
                    status: true,
                    message: "Workspace user update successfully",
                    workspace: update,
               });
          } else {
               res.status(400).json({
                    status: false,
                    message: "Workspace not found",
               });
          }
     } catch (error) {
          next(error);
     }
};

module.exports = { createWorkspace, getWorkspaceList, getWorkspaceDetail, updateWorkspace, getWorkspaceDetailTab };
