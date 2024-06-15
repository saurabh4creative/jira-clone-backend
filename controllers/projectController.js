const Project = require("../models/Project");
const Task = require("../models/Task");
const Workspace = require("../models/Workspace");

const createProject = async (req, res, next) => {
     try {
          const { name, category, users, workspace } = req.body;

          if (workspace) {
               const findWorkspaceID = await Workspace.findOne({ _id: workspace }).exec();

               if (findWorkspaceID) {
                    const project = await Project.create({
                         workspace: findWorkspaceID._id,
                         name: name,
                         category: category,
                         users: users,
                         author: req.user.id,
                    });

                    if (project) {
                         res.status(200).json({
                              status: true,
                              message: "Project created successfully",
                         });
                    } else {
                         res.status(400).json({
                              status: false,
                              message: "Something wrong in project creation. Please connect with admin",
                         });
                    }
               } else {
                    res.status(400).json({
                         status: false,
                         message: "Workspace not found",
                    });
               }
          } else {
               res.status(400).json({
                    status: false,
                    message: "Workspace key is missing",
               });
          }
     } catch (error) {
          if (error.code === 11000) {
               res.status(400).json({
                    status: false,
                    message: "Project is already exits",
               });

               return;
          }
          next(error);
     }
};

const getProjectList = async (req, res, next) => {
     const workspaceID = req.query.workspaceID;

     if (!workspaceID) {
          return res.status(400).send("Workspace ID is required");
     }

     try {
          const userId = req.user.id;

          const findWorkspaceID = await Workspace.findOne({ _id: workspaceID, $or: [{ users: userId }, { author: userId }] }).exec();

          if (findWorkspaceID) {
               const projects = await Project.find({ workspace: findWorkspaceID._id, $or: [{ users: userId }, { author: userId }] })
                    .sort({ createdAt: -1 })
                    .populate({
                         path: "workspace",
                    })
                    .populate({
                         path: "users author",
                         select: "firstName lastName email",
                    })
                    .exec();

               res.status(200).json({
                    status: true,
                    message: "Project list fetched successfully",
                    projects: projects,
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

const getProjectDetail = async (req, res, next) => {
     try {
          const workspaceID = parseInt(req.query.workspaceID);
          const projectID   = parseInt(req.query.projectID);
          const userId      = req.user.id;

          const project = await Project.findOne({
               workspace: workspaceID,
               _id: projectID,
               $or: [{ users: userId }, { author: userId }]
          })
          .populate({
               path: "users author",
               select: "firstName lastName email",
          })
          .exec();

          if (project) { 
               const taskCounts = await Task.aggregate([
                    { $match: { project: parseInt(projectID) } },
                    // { $unwind: "$project" },
                    // {
                    //      $group: {
                    //           _id: "$project",
                    //           taskCount: { $sum: 1 },
                    //      },
                    // },
               ]); 

               const projectDetail = {
                    ...project._doc,
                    tasks : taskCounts
               }
               
               res.status(200).json({
                    status: true,
                    message: "Project Info not found",
                    project: projectDetail
               });
          } else {
               res.status(404).json({
                    status: false,
                    message: "Project Info not found",
               });
          }
     } catch (error) {
          next(error);
     }
};

const getProjectTaskList = async (req, res, next) => {
     try {
          const projectID   = req.params.projectID;
          const userId      = req.user.id;

          const tasks = await Task.find({ project: projectID })
                    .sort({ createdAt: -1 })
                    .populate({
                         path: "assignee reporter",
                         select: "firstName lastName email",
                    }) 
                    .exec();
          
          res.status(200).json({
               status: true,
               message: "Task list fetched successfully",
               tasks: tasks  
          });
     } catch (error) {
          next(error);
     }
}

const getProjectIssueList = async (req, res, next) => {
     try {
          const projectID   = req.params.projectID; 

          const tasks = await Task.find({ project: projectID, type : 'Bug' })
                    .sort({ createdAt: -1 })
                    .populate({
                         path: "assignee reporter",
                         select: "firstName lastName email",
                    }) 
                    .exec();
          
          res.status(200).json({
               status: true,
               message: "Task list fetched successfully",
               tasks: tasks  
          });
     } catch (error) {
          next(error);
     }
}

const getProjectUserList = async (req, res, next) => {
     try {
          const projectID   = req.params.projectID;
          const userId      = req.user.id;

          const project = await Project.findOne({ _id : parseInt(projectID) })
          .select('users author')
          .populate({
               path: "users author",
               select: "firstName lastName email",
          }).exec() 
 
          const userList = project.users.map((item) => {
               return {
                    ...item._doc, 
                    type : ['User']
               }
          }); 

          const authorUser = project.author._doc;
          authorUser.type = ['Author'];
          const userData = [...userList, authorUser];
  
          const uniqueEntries = {};

          // Iterate through the list and merge types for duplicate _id
          userData.forEach(entry => {
               const { _id, type } = entry;
               if (!uniqueEntries[_id]) {
                    uniqueEntries[_id] = { ...entry };
               } else {
                    uniqueEntries[_id].type = [...new Set([...uniqueEntries[_id].type, ...type])];
               }
          });

          res.status(200).json({
               status: true,
               message: "Project Users list fetched successfully",
               users: Object.values(uniqueEntries)
          });
     } catch (error) {
          next(error);
     }
}

const updateProjectUserList = async (req, res, next) => {
     try {
          const projectID = req.params.projectID;
          const project   = await Project.findOne({ _id: projectID });

          if (project) {
               const { users } = req.body;

               const update = await Project.findOneAndUpdate(
                    { _id: projectID },
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
                    message: "Project user update successfully"
               });
          } else {
               res.status(400).json({
                    status: false,
                    message: "Project not found",
               });
          }
     } catch (error) {
          next(error);
     }
}

module.exports = { createProject, getProjectList, getProjectDetail, getProjectTaskList, getProjectUserList, updateProjectUserList, getProjectIssueList };