//looks for user that is requesting, looks for resource user id

const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  // console.log(requestUser);
  // { name: 'susan', userId: '6494a8d73ba896bc5bcbcb11', role: 'admin' }
  // console.log(resourceUserId);
  // new ObjectId("6490cdb9614ad1da88861be1") //john's id
  // console.log(typeof resourceUserId);
  //object
  //unless user role is admin OR if the id's match we want to throw an error
  if (requestUser.role === "admin") return;
  if(requestUser.userId === resourceUserId.toString()) return
  throw new CustomError.UnauthorizedError('not authorized to access this route')
};

module.exports = checkPermissions;
