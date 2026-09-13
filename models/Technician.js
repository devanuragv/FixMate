import mongoose from "mongoose";

const technicianSchema =
new mongoose.Schema({

name:String,

email:String,

phone:String,

serviceType:String,

city:String,

state:String,

pincode:String,

status:String,

rating:{
type:Number,
default:0
},

totalReviews:{
type:Number,
default:0
}

});

export default mongoose.model(
"Technician",
technicianSchema
);