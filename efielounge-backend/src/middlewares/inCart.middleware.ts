import { NextFunction } from "express";
import Cart from "../models/Orders/cart.model";
import MenuLikes from "../models/menu/likes.model";
import MenuRatings from "../models/menu/ratings.model";

async function checkIfMenuInCart(accountId:string, menuId:string){
  const exists = await Cart.findOne({account: accountId, menu: menuId});
  if(exists?.menu.toString()=== menuId){
    return true;
  }
  return false;
}

async function checkIfILiked(account:string, menuId:string){
  const exists = await MenuLikes.findOne({ account, menuId: menuId })!;
  if(exists?.menuId!.toString()=== menuId){
    return true;
  }
  return false;
}

async function checkIfIRated(account:string, menuId:string){
  const exists = await MenuRatings.findOne({ account, menu: menuId })!;
  if(exists?.menu!.toString()=== menuId){
    return true;
  }
  return false;
}

// Middleware function to cache responses
export function updateInCart(
  req: any,
  res: any,
  next: any
) {
  // Create a new property on the res object to cache the response
  res.modifyMenuResponse = async (data: any) => {
    try {
      
      let response:any = JSON.parse(data);
      let menudata:any = response.data;
      for(let menu of menudata){
        menu.inCart = await checkIfMenuInCart(req.accountId, menu._id)
        menu.iLiked = await checkIfILiked(req.accountId, menu._id)
        menu.iRated = await checkIfIRated(req.accountId, menu._id)
      }
      response.data = menudata;
      return JSON.stringify(response)
      
    } catch (error) {
      console.error("Error caching response:", error);
    }
  };

  // Intercept the send method of the response to cache the response before sending
  const originalSend = res.send;
  res.send = async function (body: any) {
    const newBody:any = await res.modifyMenuResponse(body, 3600); // Set TTL as desired
    // Call the original send method to send the response
    originalSend.call(this, newBody);
  };

  next();
}

export default updateInCart;
