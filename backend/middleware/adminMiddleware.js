const adminMiddleware = (
req,
res,
next
) => {

try {

console.log("USER TOKEN:");
console.log(req.user);

if (
req.user.role !== "admin"
) {

return res.status(403).json({
success:false,
message:"Admin Access Only"
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

export default adminMiddleware;