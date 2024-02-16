import jwt, { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()


function verifyJWT(req, rsp, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return rsp.status(401).json({ message: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
        if (err) { // The user is not authenticated
            return rsp.status(401).json({ message: 'Not authenticated' });
        }
        req.user = decoded;
        next();
    });
}

export default verifyJWT;