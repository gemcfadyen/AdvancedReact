const cookieParser = require("cookie-parser");
//start up node server, entry point of the application
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const jwt = require("jsonwebtoken");
//create a graphql yoga server
const server = createServer();

//use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
//use express middleware to populate current user

//decode the jwt token so we can get the userId on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;

  if (req.cookies.token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    //put the user id onto further requests
    req.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      //only the front end can access it on the backend
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`server is now running on port http://localhost:${deets.port}`);
  }
);
