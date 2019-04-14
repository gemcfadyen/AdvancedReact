const cookieParser = require("cookie-parser");
//start up node server, entry point of the application
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

//create a graphql yoga server
const server = createServer();

//use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
//use express middleware to populate current user

server.start(
  {
    cors: {
      //only teh front end can access it on the backend
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`server is now running on port http://localhost:${deets.port}`);
  }
);
