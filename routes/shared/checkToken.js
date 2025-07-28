const jwt = require('jsonwebtoken');

const checkToken = async(req, res, next)=>{
    try {
      const token = req.headers.authorization;
      if(!token.length) {
       return res.status(403).json({message:'No token provided'});
      }
      await jwt.verify(token, 'estore-secret-key');
      next();

    } catch(error){
        console.log('jwt token verification failed', error);
        res.status(500).json({message:'authentication failed'})
    }
}

module.exports = checkToken;