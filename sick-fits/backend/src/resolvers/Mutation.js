// Where we interact with the Prisma database
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args //because all the item details are in the args, we can spread them here
        }
      },
      info
    );
    return item;
  },

  updateItem(parent, args, ctx, info) {
    //copy of updates
    const updates = {...args};
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {id: args.id}
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = {id: args.id};
    //find the item
    const item = await ctx.db.query.item({where}, "{id, title}");

    //check the user has the permissions to delete
    //todo

    //delete it
    return ctx.db.mutation.deleteItem({where}, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    args.password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        permissions: {set: ["USER"]}
      }
    }, info);

    //create jwt token for the user
    const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
    //set jwt as cookie on the response
    console.log("In signup - the token is")
    console.log(token)
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //one year cookie
    });
    return user;
  }
};

module.exports = Mutations;
