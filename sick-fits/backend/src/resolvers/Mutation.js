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
    return ctx.db.mutation.updateItem({
      data: updates,
      where: { id: args.id }
    }, info);
  }
};

module.exports = Mutations;
