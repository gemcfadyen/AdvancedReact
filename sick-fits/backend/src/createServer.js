const { GraphQLServer } = require("graphql-yoga");

const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const db = require("./db")


//create the graphql yoga server

function createServer() {
 return new GraphQLServer({
   typeDefs: "src/schema.graphql",
   resolvers: {  //this will look for Mutation and Query types in the schema.graphql file
     Mutation,
     Query
   },
   resolverValidationOptions: {
     requireResolversForResolveType: false
   },
   context: req => ({ ...req, db })
 })
}

module.exports = createServer;