 const {OAuth2Client} = require('google-auth-library')

 const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

 async function authMidddleware(req, res, next){
     const authHeader = req.headers['authorization']
     const token = authHeader && authHeader.split(' ')[1]

     if(!token) {
         return res.status(401).json({
             error: 'Access denied! No Token provided'
         })
     }

      try {

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()

        req.user = {
            userId: payload['sub'],
            email: payload['email'],
            name: payload['name']
        }

        req.headers['x-user-id'] = payload['sub']
        req.headers['x-user-email'] = payload['email']

        next()
        
      } catch (error) {
         console.error('Token verification failed', error)
         res.statu(401).json({
             error: 'Invalid Token!'
         })
      }
 }

 module.exports = {
    authMidddleware
 }