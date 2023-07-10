const users = [];
import mongoose from 'mongoose';
import { User } from '../Models/Users.Model.js';
import { Contact } from '../Models/Contact.Model.js';
import { Message } from '../Models/Messages.Model.js';
import { Groups } from '../Models/Group.Model.js';
import { GroupUsers } from '../Models/GroupUser.Model.js';
import { groupMsg } from '../Models/GroupMessage.Model.js';

// Email Match
export const UserEmailMatch=async(email, created_by) => {
  const contact = await User.findOne({ email: email });
  return contact;
}

/**
 * Contact List
 */
// Contact Match
export const contactEmail=async(email, created_by) =>{
  const contact = await Contact.findOne({ email: email, created_by: created_by });
  return contact;
}

// Get All Contact User wise
export const contactList=async(userId)=> {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    { $sort: { name: 1 } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Contact List search
export const searchContactData=async(name, userId)=> {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    { $sort: { name: 1 } },
    { $match: { name: { $regex: name, $options: 'i' }} },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Last Message 
export const lastMsg=async(userId, receiverId) =>{
  const contactList = await Message.findOne({ $or: [{ "sender_id": userId, "receiver_id": receiverId }, { "sender_id": receiverId, "receiver_id": userId }] }).sort({ _id: -1 }).limit(1);
  return contactList;
}
// Edit Last Message
export const EditlastMsg=async(userId, receiverId) =>{
  const contactList = await Message.findOne({ $or: [{ "sender_id": userId, "receiver_id": receiverId }, { "sender_id": receiverId, "receiver_id": userId }] }).sort({ _id: -1 }).limit(1);
  return contactList;
}

/**
 * Single Chat
 */
// Single Message Search
export const messageSearchData=async(name, user_id, receiverId)=> {
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: user_id }, { sender_id: user_id }] }],
      },
    },
    {
      $match: {
        $and: [
          { $or: [{ receiver_id: receiverId }, { sender_id: receiverId }] },
        ],
      },
    },
    { $match:  {message: { $regex: name, $options: 'i' } } },
    { $sort: { _id: -1 } },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        user_id: "$matches._id",
        name: "$matches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Receiver Data Get
export const receiverData=async(id)=> {
  const receiverData = await User.findById(id);
  return receiverData;
}

// Unread Message Get
export const sendUnreadMsg=async(receiver_id)=> {
  const message = await Message.find({ receiver_id: receiver_id, unread: "0" });
  return message;
}

// Receiver Message Get
export const receiverMessage=async(id)=> {
  // return message;
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
      },
    },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        user_id: "$matches._id",
        name: "$matches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Message Update
export const messageUpdate=async(id, message, flag)=> {
  const message_update = await Message.findByIdAndUpdate(id, { message, flag });
  return message_update;
}

// User Id Wise contact Get
export const userJoin=async(userId) =>{
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$unread", "0"] },
            },
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
        ],
        as: "msg",
      },
    },
    { $sort: { msg: -1 } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        unreadMsg: "$msg.unread",
        last_msg_date: "$last_msg_date"
      }
    },
  ]);
  return users;
}

// contact wise sender and receiver message
export const userMessage=async(id, user_id, receiverId, startm)=> {
  const message = await Message.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    {
      $lookup: {
        from: "contacts",
        let: { nsenderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$user_id", "$$nsenderId"] },
            },
          },
          { $limit: 1 },
        ],
        as: "nmatches",
      },
    },
    {
      $match: {
        $and: [{ $or: [{ receiver_id: id }, { sender_id: id }] }],
      },
    },
    { $sort: { _id: -1 } },
    { $skip: startm },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        flag: "$flag",
        sender_id: "$sender_id",
        receiver_id: "$receiver_id",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        user_id: "$matches._id",
        name: "$nmatches.name",
        image: "$matches.image",
      },
    },
  ]);
  return message;
}

// Update Unread Message
export const updateUnreadMsg=async(receiver_Id, unread) =>{
  const message_update = await Message.updateMany(
    { sender_id: receiver_Id },
    { unread }
  );
  return message_update;
}

// Message Update
export const groupData=async(id)=> {
  const group_data = await Groups.findById(id);
  return group_data;
}

// Single Message Typing Set
export const groupById=async(groupsId) =>{
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "users",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "user",
      },
    },
    { $match: { group_id: groupsId } },
    {
      $project: {
        unread: "$unread",
        is_admin: "$is_admin",
        contact_id: "$contact_id",
        group_id: "$group_id",
        name: "$user.name",
        user_id: "$user._id",
      },
    },
  ]);
  return contactList;
}

// Single Message Typing Set
export const groupContactsList=async(groupsId, userId) =>{
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "users",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "contacts",
        let: { id: "$contact_id" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ["$user_id", "$$id"] }, { $eq: ["$created_by", userId] }] },
            },
          },
        ],
        as: "contacts",
      },
    },
    { $match: { group_id: groupsId } },
    {
      $project: {
        unread: "$unread",
        is_admin: "$is_admin",
        contact_id: "$contact_id",
        group_id: "$group_id",
        name: "$user.name",
        user_id: "$user._id",
        contactName: "$contacts.name"
      },
    },
  ]);
  return contactList;
}

// Single Message Delete
export const messageDelete=async(id,flag) =>{
  // const message_delete = await Message.findByIdAndDelete(id);
  const message_delete = await Message.findByIdAndUpdate(id, { flag });
  return message_delete;
}

/**
 * Group Message
 */
// Group Search
export const searchGroupData=async(name, userId)=> {
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "groups",
        let: { id: "$group_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "group",
      },
    },
    { $match: { "group.name": { $regex: name, $options: 'i' }} },
    { $match: { contact_id: userId } },
    {
      $project: {
        userId: "$user_id",
        name: "$group.name",
        description: "$group.description",
        userId: "$group.userId",
        group_id: "$group._id",
        unread: "$unread",
        contact_id: "$contact_id",
      },
    },
  ]);
  return contactList;
}

// Single Group Message Search
export const groupSearchData=async(name, id)=> {
  const groupMessage = await groupMsg.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    { $match: { group_id: id } },
    { $match: { message: { $regex: name, $options: 'i' }} },
    { $sort: { _id: -1 } },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        group_id: "$group_id",
        name: "$matches.name",
        image: "$matches.image",
        file_upload: "$file_upload",
        createdAt: "$createdAt",
      },
    },
  ]);
  return groupMessage;
}

// Unread Group User Get
export const unreadGroupUser=async(groupsId)=> {
  const unread_user = await GroupUsers.find({ group_id: groupsId });
  return unread_user;
}

// Update Unread Message
export const updateUnreadGroupUser=async(groupsId, contactId, unread)=> {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId, contact_id: contactId },
    { unread }
  );
  return message_update;
}

// Group Message Get
export const groupsMessage=async(id, startm = 0) =>{
  const groupMessage = await groupMsg.aggregate([
    {
      $lookup: {
        from: "users",
        let: { senderId: "$sender_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$senderId" }] },
            },
          },
        ],
        as: "matches",
      },
    },
    { $match: { group_id: id } },
    { $sort: { _id: -1 } },
    { $skip: startm },
    { $limit: 10 },
    {
      $project: {
        message: "$message",
        sender_id: "$sender_id",
        group_id: "$group_id",
        createdAt: "$createdAt",
        name: "$matches.name",
        image: "$matches.image",
        file_upload: "$file_upload",
      },
    },
  ]);
  return groupMessage;
}

// group message Update
export const groupMessageUpdate=async(id, message)=> {
  const message_update = await groupMsg.findByIdAndUpdate(id, { message });
  return message_update;
}

// Contact Detail get By User Id
export const contactListByUser=async(userId)=>{
  const contactList = await GroupUsers.aggregate([
    {
      $lookup: {
        from: "groups",
        let: { id: "$group_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$id" }] },
            },
          },
        ],
        as: "group",
      },
    },
    { $match: { contact_id: userId } },
    {
      $project: {
        userId: "$user_id",
        name: "$group.name",
        description: "$group.description",
        userId: "$group.userId",
        group_id: "$group._id",
        unread: "$unread",
        contact_id: "$contact_id",
      },
    },
  ]);
  return contactList;
}

// Update All Unread Message Update
export const updateUnreadGroupMessage=async(groupsId, userId, unread)=> {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId, contact_id: userId },
    { unread }
  );
  return message_update;
}

// Update All Unread Message Update
export const updateAllUnreadGroupMessage=async(groupsId, unread)=> {
  const message_update = await GroupUsers.updateMany(
    { group_id: groupsId},
    { unread }
  );
  return message_update;
}

// Remove Group Attached file
export const groupFileDelete=async(id) =>{
  const message_delete = await groupMsg.findByIdAndDelete(id);
  return message_delete;
}

// Delete Group Member
export const groupDeleteMember=async(id, group_id) =>{
  const group_delete = await GroupUsers.deleteOne({ contact_id: id, group_id: group_id });
  return group_delete;
}

// Delete Group All Member
export const groupMemberDelete=async(id)=> {
  const group_delete = await GroupUsers.deleteMany({ group_id: id });
  return group_delete;
}

// Delete Group All Message
export const groupMsgDelete=async(id)=>{
  const group_delete = await groupMsg.deleteMany({ group_id: id });
  return group_delete;
}

// Delete Group
export const groupDelete=async(id) =>{
  const group_delete = await Groups.findByIdAndDelete(id);
  return group_delete;
}

// Group User Delete
export const deleteGroupUser=async(id, group_id)=> {
  const group_user_delete = await GroupUsers.deleteOne({
    contact_id: id,
    group_id: group_id,
  });
  return group_user_delete;
}

// All Group Message Delete
export const allGroupMessageDelete=async(id) =>{
  const group_delete = await groupMsg.deleteMany({ group_id: id });
  return group_delete;
}

// Single All Message Delete
export const singleGroupMessageDelete=async(contactId, groupId)=> {
  const group_delete = await groupMsg.deleteMany({
    group_id: contactId,
    sender_id: groupId,
  });
  return group_delete;
}

// Single All Message Delete
export const groupSenderMessage=async(contactId, groupId)=> {
  const group_msg = await groupMsg.find({ group_id: contactId, sender_id: groupId });
  return group_msg;
}

/**
 * Setting 
 */
// Current User Info
export const currentUser=async(id) =>{
  const userInfo = await User.findById(id);
  return userInfo;
}

// current user name edit
export const userNameUpdate=async(id, name) =>{
  const message_update = await User.findByIdAndUpdate(id, { name });
  return message_update;
}

// current user name edit
export const receiverNameUpdate=async(userId, receiverId, name)=> {
  const message_update = await Contact.updateOne({ "created_by": userId, "user_id": receiverId }, { name });
  return message_update;
}

// Group name Update
export const groupNameUpdate=async(id, name) =>{
  const message_update = await Groups.findByIdAndUpdate(id, { name });
  return message_update;
}

// notification security 
export const notificationUpdate=async(id, notification)=> {
  const message_update = await User.findByIdAndUpdate(id, { notification });
  return message_update;
}

// notification muted security 
export const notificationMutedUpdate=async(id, is_muted) =>{
  const message_update = await User.findByIdAndUpdate(id, { is_muted });
  return message_update;
}

// Profile Upload
export const profileUpdate=async(id, image)=> {
  const message_update = await User.findByIdAndUpdate(id, { image });
  return message_update;
}

export const contactListByUserId=async(userId, created_by)=> {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    { $match: { user_id: userId } },
    { $match: { created_by: created_by } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location"
      },
    },
  ]);
  return users;
}


export const lastMessageShow=async(userId)=> {
  const messages = await Message.aggregate([
    {
      $match: {
        $and: [{ $or: [{ receiver_id: userId }, { sender_id: userId }] }],
      },
    },
    {
      $sort: {
        created: -1,
      },
    },
    {
      $group: {
        _id: "$receiver_id",
        message: {
          $last: "$message",
        },
        created: {
          $last: "$createdAt",
        },
      },
    },
    {
      $project: {
        _id: 0,
        from: "$_id",
        message: 1,
        created: 1,
      },
    },
  ]);
  return messages;
}

export const searchData=async(name, userId)=> {
  const users = await Contact.aggregate([
    {
      $lookup: {
        from: "users",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", { $toObjectId: "$$userId" }] },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "message",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { userId: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$unread", "0"] },
            },
            $match: {
              $expr: { $eq: ["$sender_id", "$$userId"] },
            },
          },
        ],
        as: "msg",
      },
    },
    { $sort: { message: -1 } },
    { $match: { name: new RegExp(name) } },
    { $match: { created_by: userId } },
    {
      $project: {
        name: "$name",
        email: "$email",
        user_id: "$user_id",
        created_by: "$created_by",
        userImg: "$user.image",
        createdAt: "$user.createdAt",
        location: "$user.location",
        message: "$message.message",
        file_upload: "$message.file_upload",
        unreadMsg: "$msg.unread",
        created_at: "$message.createdAt",
      },
    },
  ]);
  return users;
}

// Delete Contact
export const contactDelete=async(receiverId, userId)=> {
  const contact_delete = await Contact.deleteMany({ "user_id": { $in: [receiverId, userId] }, "created_by": { $in: [userId, receiverId] } });
  return contact_delete;
}

// All Message Delete
export const allMessageDelete=async(id, uid)=> {
  const message_delete = await Message.deleteMany({ $or: [{ $and: [{ receiver_id: id }, { sender_id: uid }] }, { $and: [{ sender_id: id }, { receiver_id: uid }] }] });
  return message_delete;
}

// All Sender Message Delete
export const allSenderMessageDelete=async(id)=> {
  const message_delete = await Message.deleteMany({ sender_id: id });
  return message_delete;
}

/**
 * Group List
 */
export const groupContactById=async(contactId)=> {
  const groupdetail = await User.find({ _id: contactId });
  return groupdetail;
}

export const unreadGroupMessage=async(groupsId)=>{
  const group_message = await groupMsg.find({ group_id: groupsId, unread: 0 });
  return group_message;
}

/**
 * Remove Single Message
 */
export const groupMessageDelete=async(id)=> {
  const message_delete = await groupMsg.findByIdAndDelete(id);
  return message_delete;
}

export const groupByGroupUser=async(groupsIds, contacts)=> {
  const groups1 = await GroupUsers.aggregate([
    { $match: { $expr: { $in: ["$group_id", contacts[0].groupId] } } },
    { $match: { $expr: { $in: ["$contact_id", contacts[0].contactId] } } },
    {
      $project: {
        userId: contacts[0].userId,
        contactId: "$contact_id",
        groupId: "$group_id",
      },
    },
  ]);
  return groups1;
}

export const groupsList=async(contactId, unread) =>{
  const group_user = await Groups.aggregate([
    { $match: { $expr: { $eq: ["$_id", { $toObjectId: contactId }] } } },
    {
      $project: {
        name: "$name",
        description: "$description",
      },
    },
  ]);
  return group_user;
}

// Current User Group
export const currentUsergroupList=async(userId) =>{
  const group_user = await Groups.find({ userId: userId });
  return group_user;
}

/**
 * Update Notification
 */
// User leaves chat
export const userLeave=async({ id }) =>{
  const user = await User.updateOne({ _id: id }, { $set: { "active": 'false' } })
  return user;
}


