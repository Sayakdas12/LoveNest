import { gql } from "@apollo/client";

// ─── User / Auth ─────────────────────────────────────────────────────────────

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      firstName
      lastName
      emailId
      age
      gender
      photoUrl
      About
      Skills
      isPremium
      membershiptype
      membershipExpiry
      role
      isOnline
      lastSeen
      faceDescriptorEnabled
      faceLockInactivityMinutes
    }
  }
`;

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const FEED_QUERY = gql`
  query Feed(
    $pageNo: Int
    $limit: Int
    $minAge: Int
    $maxAge: Int
    $gender: String
    $skills: [String]
  ) {
    feed(
      pageNo: $pageNo
      limit: $limit
      minAge: $minAge
      maxAge: $maxAge
      gender: $gender
      skills: $skills
    ) {
      users {
        _id
        firstName
        lastName
        photoUrl
        age
        gender
        About
        Skills
      }
      total
      page
      totalPages
    }
  }
`;

// ─── Connections & Requests ───────────────────────────────────────────────────

export const CONNECTIONS_QUERY = gql`
  query Connections {
    connections {
      _id
      firstName
      lastName
      photoUrl
      age
      gender
      About
      Skills
    }
  }
`;

export const RECEIVED_REQUESTS_QUERY = gql`
  query ReceivedRequests {
    receivedRequests {
      _id
      status
      createdAt
      fromUserId {
        _id
        firstName
        lastName
        photoUrl
        age
        gender
        About
        Skills
      }
    }
  }
`;

export const NOTIFICATIONS_COUNT_QUERY = gql`
  query NotificationsCount {
    notificationsCount
  }
`;

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const CHAT_HISTORY_QUERY = gql`
  query ChatHistory($userId: ID!, $before: String, $limit: Int) {
    chatHistory(userId: $userId, before: $before, limit: $limit) {
      _id
      senderId
      receiverId
      text
      type
      mediaUrl
      audioUrl
      audioDuration
      fileUrl
      fileName
      fileSize
      stickerId
      readAt
      pinned
      pinnedAt
      editedAt
      deletedForAll
      createdAt
      reactions {
        userId
        emoji
      }
      replyTo {
        _id
        text
        type
        senderId
      }
    }
  }
`;

// ─── Calls ────────────────────────────────────────────────────────────────────

export const CALL_HISTORY_QUERY = gql`
  query CallHistory($page: Int, $limit: Int) {
    callHistory(page: $page, limit: $limit) {
      _id
      callId
      type
      status
      duration
      startedAt
      endedAt
      createdAt
      callerId {
        _id
        firstName
        lastName
        photoUrl
      }
      receiverId {
        _id
        firstName
        lastName
        photoUrl
      }
    }
  }
`;

// ─── Admin ────────────────────────────────────────────────────────────────────

export const ADMIN_STATS_QUERY = gql`
  query AdminStats {
    adminStats {
      totalUsers
      premiumUsers
      totalMessages
      totalConnections
      totalCalls
      newUsersToday
    }
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($page: Int, $limit: Int, $search: String, $role: String) {
    adminUsers(page: $page, limit: $limit, search: $search, role: $role) {
      users {
        _id
        firstName
        lastName
        emailId
        photoUrl
        age
        gender
        isPremium
        membershiptype
        membershipExpiry
        role
        createdAt
        isOnline
      }
      total
      page
      pages
    }
  }
`;

export const ADMIN_CALLS_QUERY = gql`
  query AdminCalls($page: Int, $limit: Int) {
    adminCalls(page: $page, limit: $limit) {
      calls {
        _id
        callId
        type
        status
        duration
        createdAt
        callerId {
          _id
          firstName
          lastName
          photoUrl
        }
        receiverId {
          _id
          firstName
          lastName
          photoUrl
        }
      }
      total
    }
  }
`;
