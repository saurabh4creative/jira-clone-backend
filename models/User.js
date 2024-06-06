const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema(
     {
          _id: { type: Number },
          firstName: { type: String },
          lastName: { type: String },
          email: { type: String, required: [true, "Email is required"], unique: true },
          password: { type: String },
          role: { type: String, default: "user" },
          avatar: { type: String },
          isActive: { type: Boolean, default: true },
          createdAt: { type: Date, default: Date.now() },
          updatedAt: { type: Date, default: Date.now() },
     } 
); 

userSchema.plugin(AutoIncrement, { inc_field: '_id', id : "user" });

userSchema.pre("save", async function (next) {
     if (!this.isModified("password")) {
          next();
     }

     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
     return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);