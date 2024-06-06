const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const projectSchema = new Schema({
     _id: { type: Number },
     name: { type: String, required: true },
     category: { type: String, required: true },
     status: { type: String, default: "Backlog" },
     users: [{ type: Number, ref: "User" }],
     author: { type: Number, ref: "User", required: true },
     workspace: { type: Number, ref: "Workspace", required: true },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
});

projectSchema.plugin(AutoIncrement, { inc_field: '_id', id : "project" });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
