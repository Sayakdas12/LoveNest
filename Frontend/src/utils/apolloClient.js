import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Log GraphQL / network errors in development
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (import.meta.env.DEV) {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.warn(`[GraphQL error] ${extensions?.code ?? ""}: ${message}`);
      });
    }
    if (networkError) {
      console.warn("[Network error]", networkError);
    }
  }
});

const httpLink = new HttpLink({
  uri: `${BASE_URL}/graphql`,
  // Send the JWT cookie automatically on every request
  credentials: "include",
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Merge paginated feed pages instead of replacing them
          feed: {
            keyArgs: ["minAge", "maxAge", "gender", "skills"],
            merge(existing, incoming) {
              return incoming; // components handle their own page state
            },
          },
          // Chat history: merge older messages prepended before newer ones
          chatHistory: {
            keyArgs: ["userId"],
            merge(existing = [], incoming) {
              return [...incoming, ...existing];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

export default client;
