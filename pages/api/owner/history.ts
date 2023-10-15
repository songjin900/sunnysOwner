import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

interface DataToUpdate {
  deliveryStatus?: string,
  deliveryDate?: Date
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { admin },
    body: { orderId, deliveryStatus, deliveryDate }
  } = req;

  if (!admin){
    res.json({ ok: false });
    return;
  }

  //Find all order - status here is payment status $
  if (req.method === "GET") {

    const order = await client.order.findMany({
      where: {
        status: "complete"
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
        orderItem: {
          include: {
            product: true,            
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })

    res.json({ ok: true, order });
  }

  //update Status
  if (req.method === "POST") {

    const dataToUpdate: DataToUpdate = {};
    
    if (deliveryStatus){
      dataToUpdate.deliveryStatus = deliveryStatus
    }  

    if (deliveryDate) {
      dataToUpdate.deliveryDate = deliveryDate;
    }


    const order = await client.order.update({
      where: {
        id: orderId
      },
      data: dataToUpdate,
    });

    res.json({
      ok: true,
      order,
    });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
