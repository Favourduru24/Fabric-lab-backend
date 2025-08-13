 const {AuthClient, OAuth2Client} = require('google-auth-library')

 const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
//  const client = new AuthClient(process.env.GOOGLE_CLIENT_ID)

 async function authMiddleware(req, res, next){
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
        // req.headers['x-user-email'] = payload['email']

        next()
        
      } catch (error) {
         console.log('Token verification failed', error)
         res.status(500).json({
             error: 'Something went wrong: Invalid Token!'
         })
      }
 }

module.exports = { authMiddleware };