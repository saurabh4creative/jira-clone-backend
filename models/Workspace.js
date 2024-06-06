const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const workspaceSchema = new Schema({ 
     _id : {type : Number}, 
     name: { type: String, required: true, unique: true },
     description: { type: String, required: true },
     users: [{ type: Number, ref: "User" }],
     author: { type: Number, ref: "User", required: true },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
});

workspaceSchema.plugin(AutoIncrement, { inc_field: '_id', id : "workspace" });

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;