import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { ShippingCostCalculator } from "@libs/client/shippingCostCalculator";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  try {
    //Get order by user id and status
    if (req.method === "GET") {
      const {
        session: { user },
        query: { status },
      } = req;

      if (!user) {
        res.json({
          ok: false,
        });
        return;
      }

      const receivedStatus = status === undefined ? "new" : status?.toString();

      //good
      const order = await client.order.findFirst({
        where: {
          userId: user.id,
          status: receivedStatus,
        },
        include: {
          billingAddress: true,
          shippingAddress: true,
          orderItem: true,
        },
        orderBy: {
          id: "desc",
        },
      });

      res.json({ ok: true, order });
    }

    //Create new order when user click "checkout"
    if (req.method === "POST") {
      const {
        session: { user },
        body: { useSameAddress },
      } = req;

      if (!user) {
        res.json({
          ok: false,
        });
        return;
      }

      const cart = await client.cart.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: true,
        },
      });

      let totalCostBeforeTax = "";
      let totalCostAfterTax = "";
      let tax = "";
      let shipping = "";

      if (cart && cart.length > 0) {
        const totalQuantity = cart
          ? cart.reduce((acc, item) => acc + item.quantity, 0)
          : 0;

        const totalCostBeforeTaxNumber = cart
          .map((product) => {
            return product.quantity * product.product.price;
          })
          .reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          });
        const shippingCost = ShippingCostCalculator(totalCostBeforeTaxNumber) ?? 5
        const taxNumber = (totalCostBeforeTaxNumber + shippingCost) * 0.13;
        const totalCostAfterTaxNumber =
          totalCostBeforeTaxNumber + shippingCost + taxNumber;

        totalCostBeforeTax = totalCostBeforeTaxNumber.toFixed(2);
        totalCostAfterTax = totalCostAfterTaxNumber.toFixed(2);
        tax = taxNumber.toFixed(2);
        shipping = shippingCost.toFixed(2).toString()
      }

      //This is unnecessary step but if there more than one order with new status, then delete all then proceed to bottom step.
      const removeExcessOrders = async () => {
        const orders = await client.order.findMany({
          where: {
            id: user.id,
            status: "new",
          },
        });

        if (orders.length > 1) {
          const orderIdsToRemove = orders.slice(1).map((order) => order.id);
          await client.order.deleteMany({
            where: {
              id: {
                in: orderIdsToRemove,
              },
            },
          });
        }
      };

      //good
      const newOrderExists = await client.order.findFirst({
        where: {
          userId: user.id,
          status: "new",
        },
      });

      if (!newOrderExists) {
        const order = await client.order.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            status: "new",
            useSameAddress,
            totalCostBeforeTax: Number(totalCostBeforeTax),
            totalCostAfterTax: Number(totalCostAfterTax),
            tax: Number(tax),
            shipping: Number(shipping),
          },
        });
        res.json({ ok: true });
      } else {
        //Update the useSameAddress checkbox field
        const orderSameAddress = await client.order.update({
          where: {
            id: newOrderExists?.id,
          },
          data: {
            useSameAddress,
            totalCostBeforeTax: Number(totalCostBeforeTax),
            totalCostAfterTax: Number(totalCostAfterTax),
            tax: Number(tax),
            shipping: Number(shipping),
          },
        });
        res.json({ ok: true });
      }
    }
  } catch (error: any) {
    const errorLog = await client.errorLog.create({
      data: {
        errorPage: "api/order/index.ts",
        errorMessage: error.message ?? "",
      },
    });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
