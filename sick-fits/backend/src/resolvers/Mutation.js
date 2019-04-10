// Where we interact with the Prisma database

const Mutations = {
  async createItem(parent, args, ctx, info) {
    console.log(`The args are ${args}`);
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
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //find the item
    const item = await ctx.db.query.item({ where }, "{id, title}");

    //check the user has the permissions to delete
    //todo

    //delete it
    return ctx.db.mutation.deleteItem({where}, info)
  }
};

module.exports = Mutations;
