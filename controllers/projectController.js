const Project = require("../models/Project");
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
               res.status(200).json({
                    status: true,
                    message: "Project Info not found",
                    project: project
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

module.exports = { createProject, getProjectList, getProjectDetail };
