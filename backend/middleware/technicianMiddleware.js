const technicianMiddleware = (
req,
res,
next
) => {

try {

if (
req.user.role !== "technician"
) {

return res.status(403).json({
success:false,
message:
"Technician Access Only"
});

}

next();

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};

export default technicianMiddleware;