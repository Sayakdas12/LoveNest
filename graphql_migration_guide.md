# LoveNest — GraphQL Migration & Optimization Guide

This document provides a comprehensive analysis of the API architecture for **LoveNest**, outlines the current integration status of GraphQL, details the exact steps for completing the migration, and suggests crucial architectural improvements to optimize performance, caching, and developer experience.

---

## 1. Current State: REST vs. GraphQL Hybrid

LoveNest currently runs a **hybrid architecture** where REST APIs and GraphQL co-exist. 

- **Backend**: Apollo Server 4 is fully integrated with Express (`Backend/src/app.js`), database connections/auth are handled in GraphQL Context (`Backend/src/graphql/context.js`), and core resolvers are implemented.
- **Frontend**: Apollo Client is set up in `App.jsx` (`Frontend/src/utils/apolloClient.js`), and multiple screens are already using GraphQL hooks.

### Mapping of Features & Protocols

| Component / Feature | Current Protocol | GraphQL Schema File (Backend) | Frontend File Location | Status / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **User Profile Fetching** | GraphQL (`me` query) | `userResolvers.js` | [Body.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Body.jsx) | **Complete** |
| **Email/Password Sign-In** | GraphQL (`login` mutation) | `userResolvers.js` | [Login.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Login.jsx) | **Complete** |
| **Sign-Out** | GraphQL (`logout` mutation) | `userResolvers.js` | [NavBar.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/NavBar.jsx) | **Complete** |
| **Google Auth Sign-In** | REST (`POST /auth/google`) | *None* | [Login.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Login.jsx) | **REST** (Migrate to GraphQL mutation) |
| **Sign-Up** | REST (`POST /signup`) | *None* | [Signup.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Signup.jsx) | **REST** (Migrate to GraphQL mutation) |
| **User Feed & Swipe Actions**| GraphQL (`feed`, `sendRequest`) | `connectionResolvers.js` | [Feed.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Feed.jsx) | **Complete** |
| **Requests & Reviews** | GraphQL (`receivedRequests`, `reviewRequest`) | `connectionResolvers.js` | [Requests.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Requests.jsx) | **Complete** |
| **Connections List** | GraphQL (`connections` query) | `connectionResolvers.js` | [Connections.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Connections.jsx) | **Complete** |
| **Profile Text Editing** | GraphQL (`editProfile` mutation) | `userResolvers.js` | [EditProfile.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/EditProfile.jsx) | **Complete** (Fallback when no image uploaded) |
| **Profile Photo Upload** | REST (`PATCH /profile/edit`) | *None* | [EditProfile.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/EditProfile.jsx) | **REST** (Best practice for multipart/form-data) |
| **Chat Message History** | GraphQL (`chatHistory` query) | `chatResolvers.js` | [ChatWindow.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/ChatWindow.jsx) | **Complete** |
| **Reactions, Pinned Messages** | GraphQL (`reactToMessage`, `pinMessage`) | `chatResolvers.js` | [ChatWindow.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/ChatWindow.jsx) | **Complete** |
| **Edit/Delete Chat Message** | REST (`PATCH /chat/message/:id`, `DELETE ...`) | *None* | [ChatWindow.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/ChatWindow.jsx) | **REST** (Migrate to GraphQL mutations) |
| **Media/Voice Chat Uploads** | REST (`POST /upload/media`) | *None* | [ChatWindow.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/ChatWindow.jsx) | **REST** (Keep REST for file upload stream) |
| **Sticker Picker** | REST (`GET /stickers`) | *None* | [StickerPicker.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/StickerPicker.jsx) | **REST** (Migrate to GraphQL query) |
| **Notifications List** | REST (`GET /notifications`) | *None* | [NavBar.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/NavBar.jsx) | **REST** (Migrate to GraphQL query) |
| **LoveBot AI Assistant** | REST (`/chatbot/*`) | *None* | [AIChat.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/AIChat.jsx) | **REST** (Migrate to GraphQL queries/mutations) |
| **Password Reset Workflows** | REST (`/auth/forgot-password`, etc.) | *None* | [ForgotPassword.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/ForgotPassword.jsx) | **REST** (Migrate to GraphQL mutations) |
| **LiveKit Call Signalling** | Sockets + REST (`POST /call/token`) | *None* | [CallModal.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/CallModal.jsx) | **Hybrid** (Keep REST for WebRTC tokens) |
| **Security (Chat/Face Lock)** | REST (`/profile/chat-lock/verify`, etc.) | *None* | [ChatLockScreen.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/FaceLock/ChatLockScreen.jsx) | **REST** (Migrate to GraphQL mutations) |

---

## 2. What Will Change After Using GraphQL?

Transitioning the rest of the application to a unified GraphQL schema will result in several key architectural and structural shifts:

### A. Redux Reduction (Caching Managed by Apollo Client)
Currently, you use Redux slices (`userSlice`, `feedSlice`, `connectionSlice`, `notificationSlice`) to store data fetched from APIs. 
- **The Shift**: Apollo Client’s `InMemoryCache` acts as a normalized, client-side database. When a query is run, Apollo caches the result. When a mutation changes data (e.g. accepting a connection), Apollo automatically updates relevant objects in the cache if their `_id` matches.
- **Result**: You can drastically reduce Redux boilerplate. Redux should only hold **non-server ephemeral state** (e.g. active Socket connections, active call UI flags).

### B. Declarative Data Fetching (Hooks over Axios)
- **The Shift**: Manual REST calls using Axios or fetch inside `useEffect` will be replaced by `useQuery` and `useMutation` hooks.
- **Result**: You no longer need to handle loading state, error state, and response variables manually. Apollo handles pagination and fetch policies (`cache-first`, `network-only`, `cache-and-network`) out-of-the-box.

### C. The Upload Pattern (Hybrid is Best Practice)
GraphQL is notoriously inefficient at handling binary file uploads (base64 serialization increases payload size by 33% and strains resolvers).
- **Recommended Architecture**: 
  1. Upload raw files (photos, audio files) to a simple REST controller (`/upload/media`).
  2. The REST endpoint uploads to Cloudinary and returns a secure JSON URL string.
  3. Send the secure URL string inside a GraphQL mutation or Socket event to save it.
  *This keeps the high-volume upload traffic on optimized REST streams while keeping metadata structured under GraphQL.*

---

## 3. Step-by-Step Implementation Roadmap

If you decide to fully migrate the remaining REST endpoints to GraphQL, follow this roadmap.

### Step 1: Migrate Notifications & Badges
*Objective: Eliminate REST polling in `NavBar.jsx`.*

1. **Backend Schema Update**: Open [typeDefs.js](file:///d:/My%20Project/LoveNest/Backend/src/graphql/typeDefs.js) and append the `Notification` type, queries, and mutations:
   ```graphql
   type Notification {
     _id: ID!
     user: ID!
     type: String!
     read: Boolean!
     createdAt: Date!
     data: NotificationData
   }

   type NotificationData {
     senderId: String
     preview: String
     callerId: String
     callerName: String
     callType: String
   }

   extend type Query {
     notifications: [Notification!]!
   }

   extend type Mutation {
     markNotificationsRead: Boolean!
     deleteNotification(id: ID!): Boolean!
   }
   ```
2. **Backend Resolvers**: Create a `notificationResolvers.js` file (or add to `userResolvers.js`):
   ```javascript
   const Notification = require("../../models/notification");

   module.exports = {
     Query: {
       notifications: async (_, __, context) => {
         context.requireAuth();
         return Notification.find({ user: context.user._id }).sort({ createdAt: -1 });
       }
     },
     Mutation: {
       markNotificationsRead: async (_, __, context) => {
         context.requireAuth();
         await Notification.updateMany({ user: context.user._id, read: false }, { read: true });
         return true;
       },
       deleteNotification: async (_, { id }, context) => {
         context.requireAuth();
         await Notification.findOneAndDelete({ _id: id, user: context.user._id });
         return true;
       }
     }
   };
   ```
3. **Frontend Integration**: Replace the Axios call in [NavBar.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/NavBar.jsx) with Apollo's `useQuery(NOTIFICATIONS_QUERY, { pollInterval: 30000 })`.

---

### Step 2: Migrate AI Chatbot (LoveBot)
*Objective: Migrate chatbot history and messages from REST.*

1. **Backend Schema**: Add Chatbot types and mutations:
   ```graphql
   type ChatbotMessage {
     role: String!
     content: String!
     createdAt: Date
   }

   extend type Query {
     chatbotHistory: [ChatbotMessage!]!
   }

   extend type Mutation {
     sendChatbotMessage(message: String!): String!
     clearChatbotHistory: Boolean!
   }
   ```
2. **Backend Resolvers**: Implement resolvers using your existing Groq AI connection logic inside `chatbotRouter.js` but adapt it to resolver structure:
   ```javascript
   const User = require("../../models/user");
   const { getGroqReply } = require("../../utils/groq"); // assume helper exists

   module.exports = {
     Query: {
       chatbotHistory: async (_, __, context) => {
         context.requireAuth();
         return context.user.chatbotHistory || [];
       }
     },
     Mutation: {
       sendChatbotMessage: async (_, { message }, context) => {
         const user = context.requireAuth();
         user.chatbotHistory.push({ role: "user", content: message });
         
         const reply = await getGroqReply(user.chatbotHistory);
         user.chatbotHistory.push({ role: "assistant", content: reply });
         await user.save();
         
         return reply;
       },
       clearChatbotHistory: async (_, __, context) => {
         const user = context.requireAuth();
         user.chatbotHistory = [];
         await user.save();
         return true;
       }
     }
   };
   ```
3. **Frontend Integration**: Refactor [AIChat.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/AIChat.jsx) to use queries and mutations from Apollo.

---

### Step 3: Migrate Sign-Up & Google OAuth
*Objective: Unify authorization on GraphQL.*

1. **Backend Schema**:
   ```graphql
   extend type Mutation {
     signup(firstName: String!, lastName: String, emailId: String!, password: String!, age: Int!, gender: String!): AuthPayload!
     loginWithGoogle(idToken: String!): AuthPayload!
   }
   ```
2. **Backend Resolvers**: Move validation logic from `authRouter.js` into your GraphQL resolvers:
   ```javascript
   const User = require("../../models/user");
   const { verifyGoogleToken } = require("../../utils/firebase-admin"); // or oauth library

   module.exports = {
     Mutation: {
       signup: async (_, args, { res }) => {
         // Hash password, save user, generate JWT, set cookie, and return User.
       },
       loginWithGoogle: async (_, { idToken }, { res }) => {
         const payload = await verifyGoogleToken(idToken);
         let user = await User.findOne({ emailId: payload.email });
         if (!user) {
           // Create new user with Google details
         }
         const token = await user.getJWT();
         res.cookie("token", token, { httpOnly: true, secure: true });
         return { user, message: "Google login successful" };
       }
     }
   };
   ```

---

### Step 4: Migrate Security (Chat Lock & Face Lock Verification)
*Objective: Convert verify endpoints into secure mutations.*

1. **Backend Schema**:
   ```graphql
   extend type Mutation {
     verifyChatLock(password: String!): Boolean!
     verifyFaceLock(descriptor: [Float!]!): Boolean!
     setChatLockPassword(password: String!): Boolean!
   }
   ```
2. **Backend Resolvers**: Implement verification in `userResolvers.js`. For example, compare cryptographic hashes or compute face descriptor distances (using Euclidean distance) in resolvers.

---

## 4. Key Improvements & Recommendations for Your App

During the review of your code, several critical opportunities for improvement were identified. Implementing these will make LoveNest feel significantly more premium, fast, and secure.

### 🌟 Improvement 1: Cache Updates (Ditching `'network-only'`)
Currently, your GraphQL queries in [Connections.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Connections.jsx) and [Requests.jsx](file:///d:/My%20Project/LoveNest/Frontend/src/component/Requests.jsx) use `fetchPolicy: 'network-only'`. This completely disables caching and forces a full network trip every time a user switches tabs.
- **Fix**: Update the cache locally in Apollo on mutation completions.
- **Example (Requests Page)**:
  When accepting a request, use the mutation's `update` cache option to automatically add the user to `CONNECTIONS_QUERY` cache and remove them from `RECEIVED_REQUESTS_QUERY`.
  ```javascript
  const [reviewRequest] = useMutation(REVIEW_REQUEST_MUTATION, {
    update(cache, { data: { reviewRequest: reviewed } }) {
      if (reviewed.status === "accepted") {
        // Read, modify, and write back connections and requests caches programmatically.
      }
    }
  });
  ```

### 🌟 Improvement 2: real-time updates via GraphQL Subscriptions
You are using Socket.io for messaging (`send_message`, `receive_message`) and LiveKit signaling. While Socket.io works great, running it alongside Apollo Server means maintaining two separate WebSocket layers.
- **Fix**: Upgrade the backend to support **GraphQL Subscriptions** over WebSockets (using `graphql-ws` and `PubSub`).
- **Benefit**: You can replace Socket.io completely with standard subscription hooks (`useSubscription` in React):
  ```graphql
  subscription OnNewMessage($userId: ID!) {
    newMessage(userId: $userId) {
      _id
      text
      senderId
    }
  }
  ```

### 🌟 Improvement 3: Secure Schema Introspection
Currently, in your `Backend/src/app.js` file:
```javascript
introspection: process.env.NODE_ENV !== "production",
```
This is a good default practice. Ensure that this environmental variable is properly injected in your production server environment (`.env.production`), otherwise anyone can view the entire database schema layout using Playground.

### 🌟 Improvement 4: Rate Limiting & Query Depth Limiting
GraphQL is vulnerable to query nested-loop DOS attacks (e.g. fetching users, then connection requests, then user inside connection request, etc. to an infinite depth).
- **Fix**: Install `graphql-depth-limit` on the backend and load validation rules in Apollo Server initialization:
  ```javascript
  const depthLimit = require('graphql-depth-limit');

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5)], // limit queries to max 5 nested levels
  });
  ```

---

## Conclusion

By finishing the migration of **Authentication (Google & Signup)**, **Notifications**, **Chatbot**, and **Stickers** to GraphQL, you will reduce your codebase’s dependencies (removing large Axios instances), streamline the frontend by utilizing Apollo Client's global caching, and establish a single source of truth for your API schemas.
