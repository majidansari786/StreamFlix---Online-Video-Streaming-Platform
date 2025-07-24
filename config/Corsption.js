const whitelist = ['http://localhost:3000','http://127.0.0.1:3000/']
const Corsoption = {
    origin:whitelist,
    methods:['GET','POST'],
    allowedHeaders:['Content-Type', 'Authorization'],
    credentials: true
};