

import Chatroom from "../../../models/Chats/chatroom.model";

export const requestChatToken = async (
  publisher: string,
  subscriber: string,
  chatId: string,
): Promise<any | null> => {

  console.log("Join room chatId ", chatId)

  if(publisher === subscriber){
    return null
  }

  let messageToken = await Chatroom.findOne({token: chatId});
 
  if (!messageToken) {
    messageToken = await Chatroom.create({
      publisher,
      subscriber,
      token:chatId,
      createdAt: new Date(),
    });
  }
  const messageTokenObj = JSON.parse(JSON.stringify(messageToken))!
  messageTokenObj.room = messageTokenObj._id
  return messageTokenObj;
};



