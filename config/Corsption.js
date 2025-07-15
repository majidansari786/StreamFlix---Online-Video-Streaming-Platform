const whitelist = ['http://localhost:3000','http://127.0.0.1:3000/']
const Corsoption = {
    origin:whitelist,
    method:['GET','POST'],
    allowedHeaders:['Content-Type', 'Authorization'],
    credential: false
};