import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { cartQuantity, id },
    session: { user },
  } = req;

  //All individual items
  if (req.method === "GET") {
   
    if (!user){
      res.json({
        ok: false
      })
      return;
    }

    //Good
    const cart = await client.cart.findFirst({
      where: {
        productId: Number(id),
        userId: user.id,
      },
    });
    
    res.json({
      ok: true,
      cart,
    });
  }

  if (req.method === "POST") {
    if (!user){
      res.json({ 
        ok: false, 
        message: "User not found" });
      return;
    }

    //Good
    //Find product already exists in the cart
    const alreadyExists = await client.cart.findFirst({
      where: {
        productId: Number(id),
        userId: user.id,
      },
    });

    //If quantity is 0 or less than 0 then remove
    if (alreadyExists && cartQuantity <= 0) {
      await client.cart.delete({
        where: {
          id: alreadyExists.id,
        },
      });
    } else {
      //this user id comes from the session. so if we delete user id from the db this would break.

      const alreadyExistsID = alreadyExists ? alreadyExists.id : -1;

      //new
      if (alreadyExistsID === -1) {
        const cart = await client.cart.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            product: {
              connect: {
                id: Number(id),
              },
            },
            quantity: cartQuantity,
          },
        });
        res.json({ ok: true, cart, message: "" });
      } else {
        const cart = await client.cart.update({
          where: {
            id: alreadyExistsID,
          },
          data: {
            quantity: alreadyExists ? alreadyExists.quantity + cartQuantity : 0,
          },
        });
        res.json({ ok: true, cart, message: "" });
      }
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
