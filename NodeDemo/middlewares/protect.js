var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');

module.exports = {
    checkLogin:
        async function (req) {
            var result = {}
            var token = req.headers.authorization;
            
            if (token&&token.startsWith("Bearer")) {
                token = token.split(" ")[1];             
            } else {
                if(req.cookies.tokenJWT){
                    token = req.cookies.tokenJWT;
                }else{
                    return result.err = "Vui long dang nhap";
                }             
            }
            try {
                var userID = await jwt.verify(token, configs.SECRET_KEY);
                return userID.id;
            } catch (error) {
                return result.err = "Vui long dang nhap";
            }
        },
    
}