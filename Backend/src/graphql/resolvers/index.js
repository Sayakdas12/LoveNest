const { GraphQLScalarType, Kind } = require("graphql");
const userResolvers = require("./userResolvers");
const connectionResolvers = require("./connectionResolvers");
const chatResolvers = require("./chatResolvers");
const callResolvers = require("./callResolvers");
const adminResolvers = require("./adminResolvers");
const paymentResolvers = require("./paymentResolvers");

// Custom Date scalar — serialises to ISO string, parses from string or number
const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "ISO-8601 date-time string",
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return value ? new Date(value).toISOString() : null;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers = {
  Date: DateScalar,

  Query: {
    ...userResolvers.Query,
    ...connectionResolvers.Query,
    ...chatResolvers.Query,
    ...callResolvers.Query,
    ...adminResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...connectionResolvers.Mutation,
    ...chatResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...adminResolvers.Mutation,
  },
};

module.exports = resolvers;
