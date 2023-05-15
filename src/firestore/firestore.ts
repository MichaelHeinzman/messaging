import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Conversation,
  Message,
  ReadBy,
  RecentMessage,
  User as UserType,
} from "../../typings";
import { User } from "firebase/auth";

export const createGroup = (newGroup: Conversation) => {
  const groupsCollectionRef = collection(db, "groups");

  // Add the group document to Firestore and update with generated ID
  return addDoc(groupsCollectionRef, newGroup)
    .then((docRef) => {
      // The document has been successfully added with an auto-generated ID.
      const groupId = docRef.id; // Retrieve the auto-generated ID.
      // Update the group document with the generated ID.
      const groupDocRef = doc(db, "groups", docRef.id);
      return updateDoc(groupDocRef, { id: groupId })
        .then(() => {
          // The group document has been updated
          console.log("Group added successfully with generated ID");

          // Create a new message with the recent message
          const recentMessage: Message = {
            id: "",
            sender: newGroup.creator,
            timestamp: new Date().toISOString(),
            read: [],
            type: "text",
            text: newGroup.recentMessage?.messageText,
            groupId: groupId,
          };

          // Call sendMessageInGroup with the recent message and group ID
          return sendMessageInGroup(recentMessage, groupId);
        })
        .catch((error) => {
          console.error("Error updating group document:", error);
        });
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error adding group:", error);
    });
};

export const sendMessageInGroup = (message: Message, groupId: string) => {
  const messageDocRef = doc(db, "message", groupId);
  const messagesCollectionRef = collection(messageDocRef, "messages");

  return addDoc(messagesCollectionRef, message)
    .then((docRef) => {
      const messageId = docRef.id;

      // Update the message document with the generated ID
      const messagesDocRef = doc(messagesCollectionRef, messageId);
      return updateDoc(messagesDocRef, { id: messageId })
        .then(() => {
          console.log("Message added successfully with generated ID");

          // Update the recentMessage in the group
          const groupDocRef = doc(db, "groups", groupId);
          return getDoc(groupDocRef)
            .then((groupSnapshot) => {
              const groupData = groupSnapshot.data() as Conversation;

              // Compare the new message timestamp with the current recentMessage timestamp
              if (
                !groupData.recentMessage ||
                message.timestamp > groupData.recentMessage.readBy.sentAt
              ) {
                const updatedRecentMessage: RecentMessage = {
                  id: messageId,
                  messageText: message.text || "",
                  readBy: {
                    sentAt: message.timestamp,
                    sentBy: message.sender,
                    read: [message.sender],
                  },
                };

                // Update the recentMessage field with the new message
                return updateDoc(groupDocRef, {
                  recentMessage: updatedRecentMessage,
                })
                  .then(() => {
                    console.log("Updated the recentMessage in the group");
                  })
                  .catch((error) => {
                    console.error("Error updating recentMessage:", error);
                  });
              }
            })
            .catch((error) => {
              console.error("Error getting group document:", error);
            });
        })
        .catch((error) => {
          console.error("Error updating message document:", error);
        });
    })
    .catch((error) => {
      console.error("Error adding message:", error);
    });
};

export const deleteGroup = async (groupId: string, ownerId: string) => {
  const groupDocRef = doc(db, "groups", groupId);

  // Get the group document data
  const groupSnapshot = await getDoc(groupDocRef);
  const groupData = groupSnapshot.data() as Conversation;

  // Check if the current user is the owner
  if (ownerId !== groupData.creator) {
    throw new Error("Only the owner can delete the group.");
  }

  // Delete the group document
  await deleteDoc(groupDocRef);

  const messagesRef = collection(db, "message", groupId, "messages");

  // Delete all messages in the group
  const querySnapshot = await getDocs(messagesRef);
  querySnapshot.forEach((doc) => deleteDoc(doc.ref));
};

export const leaveGroup = async (groupId: string, userId: string) => {
  const groupDocRef = doc(db, "groups", groupId);

  // Get the group document data
  const groupSnapshot = await getDoc(groupDocRef);
  const groupData = groupSnapshot.data() as Conversation;

  // Check if the user is a member of the group
  if (!groupData.members.includes(userId)) {
    throw new Error("User is not a member of the group.");
  }

  // Remove the user from the members list
  const updatedMembers = groupData.members.filter(
    (memberId) => memberId !== userId
  );

  // Update the group document with the updated members list
  await updateDoc(groupDocRef, { members: updatedMembers });

  // Check if there are no more members in the group
  if (updatedMembers.length === 0) {
    // Call the deleteGroup function to delete the group
    await deleteGroup(groupId, groupData.creator);
  }
};

export const addFriendByUsername = async (
  currentUserId: string,
  friendUsername: string
) => {
  // Get the reference to the users collection
  const usersCollectionRef = collection(db, "users");

  // Query the users collection to find the user with the matching username
  const querySnapshot = await getDocs(
    query(usersCollectionRef, where("username", "==", friendUsername))
  );

  if (querySnapshot.empty) {
    throw new Error("No user found with the provided username.");
  }

  // Get the friend user document from the query snapshot
  const friendUserDoc = querySnapshot.docs[0];

  // Get the friend user ID and document reference
  const friendUserId = friendUserDoc.id;
  const friendUserRef = doc(db, "users", friendUserId);

  // Update the current user's friends list
  await updateDoc(friendUserRef, { friends: arrayUnion(currentUserId) });
};

export const checkUsernameExists = async (username: string) => {
  // Get the reference to the users collection
  const usersCollectionRef = collection(db, "users");

  // Query the users collection to find the user with the matching username
  const querySnapshot = await getDocs(
    query(usersCollectionRef, where("displayName", "==", username))
  );

  return !querySnapshot.empty;
};

export const deleteMessageInGroup = async (
  messageId: string,
  groupId: string
) => {
  const messageDocRef = doc(db, "message", groupId, "messages", messageId);

  try {
    // Delete the message document
    await deleteDoc(messageDocRef);
    console.log("Message deleted successfully");

    // Update the recentMessage in the group if the deleted message was the most recent one
    const groupDocRef = doc(db, "groups", groupId);
    const groupSnapshot = await getDoc(groupDocRef);
    const groupData = groupSnapshot.data() as Conversation;

    if (groupData.recentMessage?.id === messageId) {
      const messagesRef = collection(db, "message", groupId, "messages");
      const messagesQuery = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(messagesQuery);
      const newRecentMessage = querySnapshot.docs[0]?.data() as Message;

      const readBy: ReadBy = {
        sentAt: newRecentMessage.timestamp,
        sentBy: newRecentMessage.sender,
        read: newRecentMessage.read,
      };

      const updatedRecentMessage: RecentMessage = {
        id: newRecentMessage.id,
        messageText: newRecentMessage.text || "",
        readBy: readBy,
      };

      await updateDoc(groupDocRef, { recentMessage: updatedRecentMessage });
      console.log("Updated the recentMessage in the group.");
    }
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

export const markMessageAsReadInGroup = (
  groupId: string,
  messageId: string,
  userId: string
) => {
  const groupDocRef = doc(db, "groups", groupId);

  return getDoc(groupDocRef)
    .then((groupSnapshot) => {
      const groupData = groupSnapshot.data() as Conversation;

      // Check if the group has a recentMessage field and the provided message ID matches
      if (groupData.recentMessage && groupData.recentMessage.id === messageId) {
        // Check if the user ID is not already in the read array
        if (!groupData.recentMessage.readBy.read.includes(userId)) {
          // Create a new readBy object for the user
          const newReadBy: ReadBy = {
            sentAt: new Date().toISOString(),
            sentBy: userId,
            read: [userId],
          };

          // Update the recentMessage's read array in the group document
          return updateDoc(groupDocRef, {
            "recentMessage.readBy": newReadBy,
          })
            .then(() => {
              console.log("Message marked as read in the group");
            })
            .catch((error) => {
              console.error("Error updating group document:", error);
            });
        }
      }
    })
    .catch((error) => {
      console.error("Error retrieving group document:", error);
    });
};

export const updateMessagesReadArray = (
  groupId: string,
  messageId: string,
  userId: string
) => {
  if (messageId === "") return;

  // Get the message document reference
  const messageDocRef = doc(db, "message", groupId, "messages", messageId);

  // Fetch the existing message data
  return getDoc(messageDocRef)
    .then((messageDoc) => {
      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as Message;

        // Add the user ID to the read array if it's not already present
        if (!messageData.read.includes(userId)) {
          const updatedReadArray = [...messageData.read, userId];

          // Update the message's read array in Firebase
          return updateDoc(messageDocRef, { read: updatedReadArray })
            .then(() => {
              console.log("Message read array updated in Firebase");
            })
            .catch((error) => {
              console.error(
                "Error updating message read array in Firebase:",
                error
              );
            });
        } else {
          console.log("User ID already exists in the message's read array");
          return Promise.resolve();
        }
      } else {
        console.error("Message document does not exist");
        return Promise.resolve();
      }
    })
    .catch((error) => {
      console.error("Error fetching message document:", error);
    });
};

export const updateTypingArray = async (
  groupId: string,
  user: User | null,
  action: "add" | "remove"
): Promise<void> => {
  if (user === null) return;
  try {
    const groupDocRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupDocRef);

    if (groupDoc.exists()) {
      const groupData = groupDoc.data();
      let typingArray = groupData?.typing || [];

      if (
        action === "add" &&
        !typingArray.some((u: User) => u.uid === user.uid)
      ) {
        typingArray = [
          ...typingArray,
          {
            id: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
          },
        ];
      } else if (
        action === "remove" &&
        typingArray.some((u: UserType) => u.id === user.uid)
      ) {
        typingArray = typingArray.filter((u: UserType) => u.id !== user.uid);
      } else {
        // If the action is invalid or the user is already in the typing array, no update is needed
        console.log("Invalid action or user already in the typing array.");
        return;
      }

      await updateDoc(groupDocRef, { typing: typingArray });
      console.log("Typing array updated successfully.");
    } else {
      console.log("Group not found.");
    }
  } catch (error) {
    console.error("Error updating typing array:", error);
  }
};
