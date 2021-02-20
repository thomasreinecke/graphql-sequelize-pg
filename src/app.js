
import { ApolloServer } from 'apollo-server';
import { schema } from './graphql';
import db from './db';

const server = new ApolloServer({
  schema,
  uploads: true,
  playground: true,
  introspection: true,
  tracing: true,
  context: { db }, 
  subscriptions: {
    onConnect: async (connectionParams, webSocket) => {
      console.log('connect');
    },
    onDisconnect: (webSocket) => {
      console.log('disconnect');
    }
  },
});

// once sequelize is up & running, start market data service http listener
server.listen(4000).then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
