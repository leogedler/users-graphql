const graphql = require('graphql');
const axios = require('axios');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentvalue, args) {
        const { data } = await axios.get(`http://localhost:3000/companies/${parentvalue.id}/users`);
        return data;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    companyId: { type: GraphQLString },
    company: {
      type: CompanyType,
      async resolve(parentvalue, args) {
        const { data } = await axios.get(`http://localhost:3000/companies/${parentvalue.companyId}`);
        return data;
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentvalue, args) {
        const { data } = await axios.get(`http://localhost:3000/users/${args.id}`);
        return data;
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentvalue, args) {
        const { data } = await axios.get(`http://localhost:3000/companies/${args.id}`);
        return data;
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: { 
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) } ,
        companyId: { type: GraphQLString },
      },
      async resolve(parentvalue, {firstName, age}){
        const { data } = await axios.post(`http://localhost:3000/users`, {firstName, age});
        console.log('DATA', data);
        return data;
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentvalue, args){
        const { data } = await axios.delete(`http://localhost:3000/users/${args.id}`);
        return data
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      async resolve(parentvalue, args){
        const { data } = await axios.patch(`http://localhost:3000/users/${args.id}`, args);
        return data;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});