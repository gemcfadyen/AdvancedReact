// Where we interact with the Prisma database
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {randomBytes} = require("crypto");
const {promisify} = require("util");
const {makeANiceEmail, transport} = require("../mail");
const {hasPermission} = require("../utils");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          //this is how we create a relationship between the item and the user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    const item = await ctx.db.query.item({where}, "{id, title, user {id}}");

    //check the user has the permissions to delete - either they own the item or have delete permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permissions to delete");
    }
    //delete it
    return ctx.db.mutation.deleteItem({where}, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    args.password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          permissions: {set: ["USER"]}
        }
      },
      info
    );

    //create jwt token for the user
    const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
    //set jwt as cookie on the response
    console.log("In signup - the token is");
    console.log(token);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //one year cookie
    });
    return user;
  },

  async signin(parent, {email, password}, ctx, info) {
    //check if user exists with that email
    const user = await ctx.db.query.user({where: {email}});

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    //check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    //generate the jwt token
    const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
    //set the cookie with the token
    console.log(token);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //one year cookie
    });

    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return {message: "Goodbye"};
  },

  async requestReset(parent, args, ctx, info) {
    //check if this is a real user
    const user = await ctx.db.query.user({where: {email: args.email}});

    if (!user) {
      throw new Error(`No user with the email ${args.email}`);
    }

    //set a reset token and expiry on the user
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now

    const res = await ctx.db.mutation.updateUser({
      where: {email: args.email},
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      }
    });

    //email the user the reset token
    const mailResponse = await transport.sendMail({
      from: "fake@youremail.com",
      to: user.email,
      subject: "Your reset token",
      html: makeANiceEmail(
        `Your password reset token is here! \n\n 
            <a href="${
          process.env.FRONTEND_URL
          }/reset?resetToken=${resetToken}">Click here to reset</a> `
      )
    });
    return {message: "Thanks!"};
  },
  async resetPassword(parent, args, ctx, info) {
    //check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match!");
    }

    //check if legit password token
    //check if expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) {
      throw new Error("This token is either invalid or expired");
    }
    //hash new password
    const password = await bcrypt.hash(args.password, 10);
    //save new password to the user
    //remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {email: user.email},
      data: {
        password: password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    //generate jwt
    const token = jwt.sign({userId: updatedUser.id}, process.env.APP_SECRET);

    //set the jwt cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    //return the new user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    //check if user is logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }

    //query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );

    //check if they have permissions to do this
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);

    //update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {id: args.userId}
      },
      info
    );
  }
};

module.exports = Mutations;
