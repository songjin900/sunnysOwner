import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    // session: { user },
    body: {
      userId
    }
  } = req;

  //2. Order Status = Paid or Processing
  //3. Update the preInStock in product
  //4. Once Payment completed - update the actualStock. (NOT HERE LATER once we get a confirmation of payment from paypal)
  //5. Delete the cart

  try {
    //Receive an order id then if order's user id and session.user are the same then continue otherwise return error


    //Create new order when user click "checkout"
    if (req.method === "POST") {

      //good
      const newOrderExists = await client.order.findFirst({
        where: {
          userId: userId,
          status: "new",
        },
        select: {
          id: true,
        },
      });

      if (!newOrderExists) {
        res.json({
          ok: false,
        });
        return;
      }

      const cart = await client.cart.findMany({
        where: {
          userId: userId,
        },
      });

      if (!cart || cart.length === 0){
        res.json({
          ok: false,
        });
        return;
      }

      //Update the product table quantities
      await Promise.all(
        cart.map(async (item) => {
          const product = await client.product.findUnique({
            where: {
              id: item.productId,
            },
          });
          const newstockQuantity =
            (product?.stockQuantity ?? 0) - item?.quantity;

          await client.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stockQuantity: newstockQuantity,
            },
          });
        })
      );

      const orderId = newOrderExists.id;

      await Promise.all(
        cart.map(async (item) => {
          await client.orderItem.create({
            data: {
              quantity: item.quantity,
              order: {
                connect: {
                  id: orderId,
                },
              },
              product: {
                connect: {
                  id: item.productId,
                },
              },
            },
          });
        })
      );

      await client.cart.deleteMany({
        where: {
          userId: userId,
        },
      });
      const payload = Math.floor(10000 + Math.random() * 90000) + "";

      const updateOrderStatusToComplete = await client.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: "complete",
          orderNumber:
            "O"+orderId.toString() + "U" + userId.toString() + "N" + payload,
          deliveryStatus: "Preparing",
          paymentType: "stripe",
          orderPlacedDate: new Date(),
        },
      });

      res.json({
        ok: true,
        orderNumber: updateOrderStatusToComplete.orderNumber,
        orderId,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export default withApiSession(withHandler({ methods: ["POST"], handler }));
