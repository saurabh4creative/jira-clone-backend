const mongoose = require("mongoose"); 
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const taskSchema = new Schema({
     _id: { type: Number },
     project: { type: Number, ref: "Project", required: true },
     type: { type: String, required: true },
     isTrashed: { type: Boolean, default: false },
     status: { type: String, required: true },
     summary: { type: String, required: true },
     description: { type: String },
     assignee: { type: Number, ref: "User" },
     reporter: { type: Number, ref: "User" },
     priority: { type: String, required: true },
     sprint: { type: String },
     original_estimate: { type: String },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now }
});

taskSchema.plugin(AutoIncrement, { inc_field: '_id', id : "task" });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;