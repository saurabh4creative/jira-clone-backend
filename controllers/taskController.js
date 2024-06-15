const Task = require("../models/Task");

const createTask = async (req, res, next) => {
     try {
          const userId  = req.user.id;
          const payload = req.body;
          payload.reporter = userId;
          const task = await Task.create(payload);

          if (task) {
               res.status(200).json({
                    status: true,
                    message: "Task created successfully",
                    task: task,
               });
          } else {
               res.status(400).json({
                    status: false,
                    message: "Something wrong in task creation. Please connect with admin",
               });
          }
     } catch (error) {
          next(error);
     }
};

const getTaskLists = async (req, res, next) => {
     try {
          const userId = req.user.id;
          const tasks = await Task.find({ $or: [{ assignee: userId }, { reporter: userId }] })
               .populate({
                    path: "assignee",
                    select: "firstName lastName email",
               })
               .populate({
                    path: "reporter",
                    select: "firstName lastName email",
               })
               .populate("project")
               .exec();

          res.status(200).json({
               status: true,
               message: "Task list fetched successfully",
               tasks: tasks,
          });
     } catch (error) {
          next(error);
     }
};

module.exports = { createTask, getTaskLists };