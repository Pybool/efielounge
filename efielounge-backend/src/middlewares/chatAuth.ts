
import { config as dotenvConfig } from "dotenv";

dotenvConfig();
dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

export function getChatSubscriber(publisher:string, token: string){
  const decoded = token.split("-");
  const subscriberId = decoded[1];
  if(publisher !== subscriberId){
    return subscriberId;
  }
  return decoded[0];
  
}

export async function authenticateChatToken() {
  try {
    return { status: true };
  } catch (error: any) {
    console.log(error);
    return { status: false };
  }
}
