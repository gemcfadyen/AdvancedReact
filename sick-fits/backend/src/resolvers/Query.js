const { forwardTo } = require("prisma-binding");

const Query = {
  //method to line up with the queries we have
  // dogs(parent, args, ctx, info) {
  //   return global.dogs;//[{ name: "Snickers" }, { name: "Sunny" }]; //this data can come from anywhere, connect to a db, parse a csv file
  // }

  items: forwardTo('db')
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items({ ...args });
  //   return items;
  // }
};

module.exports = Query;
