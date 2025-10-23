const jwt=require('jsonwebtoken')
const secret="ILSsrinagar1234"
function setUser(user){
  return jwt.sign({
    _id:user._id,
    username:user.username,
    role: user.role
  },secret)
}
function getUser(token) {
  if(!token) return null;
  return jwt.verify(token,secret)
}

module.exports = {
  setUser,
  getUser,
};


//auth headers bearer