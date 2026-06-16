import { gql } from "@apollo/client";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation Login($emailId: String!, $password: String!) {
    login(emailId: $emailId, password: $password) {
      message
      user {
        _id
        firstName
        lastName
        emailId
        photoUrl
        age
        gender
        About
        Skills
        isPremium
        membershiptype
        role
        faceDescriptorEnabled
        faceLockInactivityMinutes
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const EDIT_PROFILE_MUTATION = gql`
  mutation EditProfile($input: EditProfileInput!) {
    editProfile(input: $input) {
      _id
      firstName
      lastName
      age
      gender
      About
      Skills
      photoUrl
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

// ─── Connections ──────────────────────────────────────────────────────────────

export const SEND_REQUEST_MUTATION = gql`
  mutation SendRequest($toUserId: ID!, $status: String!) {
    sendRequest(toUserId: $toUserId, status: $status) {
      _id
      status
    }
  }
`;

export const REVIEW_REQUEST_MUTATION = gql`
  mutation ReviewRequest($requestId: ID!, $status: String!) {
    reviewRequest(requestId: $requestId, status: $status) {
      _id
      status
    }
  }
`;

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const REACT_TO_MESSAGE_MUTATION = gql`
  mutation ReactToMessage($userId: ID!, $msgId: ID!, $emoji: String!) {
    reactToMessage(userId: $userId, msgId: $msgId, emoji: $emoji) {
      _id
      reactions {
        userId
        emoji
      }
    }
  }
`;

export const PIN_MESSAGE_MUTATION = gql`
  mutation PinMessage($msgId: ID!) {
    pinMessage(msgId: $msgId) {
      _id
      pinned
      pinnedAt
    }
  }
`;

export const BOOKMARK_MESSAGE_MUTATION = gql`
  mutation BookmarkMessage($msgId: ID!) {
    bookmarkMessage(msgId: $msgId) {
      _id
    }
  }
`;

// ─── Face Lock ────────────────────────────────────────────────────────────────

export const ENROLL_FACE_LOCK_MUTATION = gql`
  mutation EnrollFaceLock($descriptor: [Float!]!) {
    enrollFaceLock(descriptor: $descriptor)
  }
`;

// ─── Payment ─────────────────────────────────────────────────────────────────

export const CREATE_PAYMENT_ORDER_MUTATION = gql`
  mutation CreatePaymentOrder($membershipType: String!) {
    createPaymentOrder(membershipType: $membershipType) {
      orderId
      amount
      currency
      receipt
      keyId
    }
  }
`;

// ─── Admin ────────────────────────────────────────────────────────────────────

export const ADMIN_UPDATE_USER_MUTATION = gql`
  mutation AdminUpdateUser($id: ID!, $input: AdminUserUpdateInput!) {
    adminUpdateUser(id: $id, input: $input) {
      _id
      firstName
      lastName
      emailId
      role
      isPremium
      membershiptype
      membershipExpiry
    }
  }
`;

export const ADMIN_DELETE_USER_MUTATION = gql`
  mutation AdminDeleteUser($id: ID!) {
    adminDeleteUser(id: $id)
  }
`;

export const ADMIN_DELETE_MESSAGE_MUTATION = gql`
  mutation AdminDeleteMessage($id: ID!) {
    adminDeleteMessage(id: $id)
  }
`;
