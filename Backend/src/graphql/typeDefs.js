const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar Date

  # ─── Core Types ──────────────────────────────────────────────────────────────

  type User {
    _id: ID!
    firstName: String!
    lastName: String
    emailId: String!
    age: Int
    gender: String
    photoUrl: String
    About: String
    Skills: [String]
    isPremium: Boolean
    membershiptype: String
    membershipExpiry: Date
    role: String
    isOnline: Boolean
    lastSeen: Date
    faceDescriptorEnabled: Boolean
    faceLockInactivityMinutes: Int
    createdAt: Date
  }

  type ConnectionRequest {
    _id: ID!
    fromUserId: User
    toUserId: User
    status: String!
    createdAt: Date
  }

  type Reaction {
    userId: ID
    emoji: String
  }

  type Message {
    _id: ID!
    senderId: ID!
    receiverId: ID!
    text: String
    type: String
    mediaUrl: String
    audioUrl: String
    audioDuration: Int
    fileUrl: String
    fileName: String
    fileSize: Int
    stickerId: String
    readAt: Date
    pinned: Boolean
    pinnedAt: Date
    reactions: [Reaction]
    replyTo: Message
    editedAt: Date
    deletedForAll: Boolean
    createdAt: Date
  }

  type Call {
    _id: ID!
    callId: String!
    callerId: User
    receiverId: User
    type: String!
    status: String!
    duration: Int
    startedAt: Date
    endedAt: Date
    createdAt: Date
  }

  type AdminStats {
    totalUsers: Int!
    premiumUsers: Int!
    totalMessages: Int!
    totalConnections: Int!
    totalCalls: Int!
    newUsersToday: Int!
  }

  type PaginatedFeed {
    users: [User!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type AdminUsersResult {
    users: [User!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type AdminCallsResult {
    calls: [Call!]!
    total: Int!
  }

  type PaymentOrder {
    orderId: String!
    amount: Int!
    currency: String!
    receipt: String
    keyId: String!
  }

  type AuthPayload {
    user: User!
    message: String!
  }

  # ─── Input Types ─────────────────────────────────────────────────────────────

  input EditProfileInput {
    firstName: String
    lastName: String
    age: Int
    gender: String
    About: String
    Skills: [String]
    photoUrl: String
  }

  input AdminUserUpdateInput {
    role: String
    isPremium: Boolean
    membershiptype: String
    membershipExpiry: Date
  }

  # ─── Queries ─────────────────────────────────────────────────────────────────

  type Query {
    "Returns the currently authenticated user's profile"
    me: User

    "Paginated feed of potential matches (excludes already-interacted users)"
    feed(
      pageNo: Int
      limit: Int
      minAge: Int
      maxAge: Int
      gender: String
      skills: [String]
    ): PaginatedFeed!

    "All accepted connections for the current user"
    connections: [User!]!

    "All pending 'interested' requests sent to the current user"
    receivedRequests: [ConnectionRequest!]!

    "Count of pending 'interested' requests (notification badge)"
    notificationsCount: Int!

    "Cursor-paginated message history between current user and another user"
    chatHistory(
      userId: ID!
      before: String
      limit: Int
    ): [Message!]!

    "Paginated call history for the current user"
    callHistory(
      page: Int
      limit: Int
    ): [Call!]!

    # ── Admin Queries (admin role required) ──────────────────────────────────

    "Platform-wide stats (admin only)"
    adminStats: AdminStats!

    "Paginated user list (admin only)"
    adminUsers(
      page: Int
      limit: Int
      search: String
      role: String
    ): AdminUsersResult!

    "Platform-wide paginated call log (admin only)"
    adminCalls(
      page: Int
      limit: Int
    ): AdminCallsResult!
  }

  # ─── Mutations ───────────────────────────────────────────────────────────────

  type Mutation {
    "Login with email and password — sets JWT cookie in response"
    login(emailId: String!, password: String!): AuthPayload!

    "Clear the JWT auth cookie"
    logout: Boolean!

    "Update the current user's profile fields"
    editProfile(input: EditProfileInput!): User!

    "Change password (requires current password for verification)"
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    "Send an 'interested' or 'ignored' request to another user"
    sendRequest(toUserId: ID!, status: String!): ConnectionRequest!

    "Accept or reject an 'interested' request directed at the current user"
    reviewRequest(requestId: ID!, status: String!): ConnectionRequest!

    "Create a Razorpay payment order for a membership"
    createPaymentOrder(membershipType: String!): PaymentOrder!

    "Toggle emoji reaction on a message"
    reactToMessage(userId: ID!, msgId: ID!, emoji: String!): Message!

    "Pin or unpin a message"
    pinMessage(msgId: ID!): Message!

    "Bookmark or remove bookmark from a message"
    bookmarkMessage(msgId: ID!): Message!

    "Enroll face descriptor for face-lock feature"
    enrollFaceLock(descriptor: [Float!]!): Boolean!

    # ── Admin Mutations ───────────────────────────────────────────────────────

    "Update a user's role/membership (admin only)"
    adminUpdateUser(id: ID!, input: AdminUserUpdateInput!): User!

    "Hard-delete a user account (admin only)"
    adminDeleteUser(id: ID!): Boolean!

    "Delete a message (admin moderation)"
    adminDeleteMessage(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
