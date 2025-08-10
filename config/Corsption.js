const whitelist = ['http://localhost:3000','http://127.0.0.1:3000/','https://stream-frontend-dun-two.vercel.app/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Only works if origin is specific
};
