import withHandler, { ResponseType } from "@libs/server/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";
import { Cart } from "@prisma/client";
import { ShippingCostCalculator } from "@libs/client/shippingCostCalculator";

interface validateQuantity {
  message: string;
  type: "update" | "remove";
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
    body: { cartArray },
  } = req;

  //somehow where:{userId} is returning value even user is null
  if (req.method === "GET") { 

    if (!user){
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

    if (cart.length === 0){
      res.json({
        ok: false,
        cart,
        totalCostBeforeTax: "0",
        totalCostAfterTax:"0",
        tax:"0",
        shipping:"0",
      });
      return;
    }   

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
      const totalCostAfterTaxNumber = totalCostBeforeTaxNumber + shippingCost + taxNumber;

      totalCostBeforeTax = totalCostBeforeTaxNumber.toFixed(2);
      totalCostAfterTax = totalCostAfterTaxNumber.toFixed(2);
      tax = taxNumber.toFixed(2);
      shipping = shippingCost.toFixed(2).toString()
    }

    res.json({
      ok: true,
      cart,
      totalCostBeforeTax,
      totalCostAfterTax,
      tax,
      shipping,
    });
  }

  if (req.method === "POST") {
    if (!user){
      res.json({
        ok: false,
      });
      return;
    }

    await Promise.all(
      cartArray.map(async (item: Cart) => {
        const alreadyExists = await client.cart.findFirst({
          where: {
            productId: Number(item.productId),
            userId: user.id,
          },
        });

        const cartId = alreadyExists ? alreadyExists.id : -1;

        if (cartId !== -1) {
          //Remove. No need
          if (item.quantity === 0) {
            const removedItem = await client.cart.delete({
              where: {
                id: cartId,
              },
            });
          } else {
            const cart = await client.cart.update({
              where: {
                id: cartId,
              },
              data: {
                quantity: item.quantity,
              },
            });
          }
        }
      })
    );

    const cart = await client.cart.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: true,
      },
    });

    let cartQuantityErrorArray: validateQuantity[] = [];

    await Promise.all(
      cart.map(async (item) => {
        const productQuantity = await client.product.findUnique({
          where: {
            id: item.productId,
          },
          select: {
            stockQuantity: true,
            price: true,
            name: true,
            image: true
          },
        });
        if (
          item.quantity > (productQuantity?.stockQuantity ?? 0) 
        ) {
          if (
            productQuantity?.stockQuantity === 0 
          ) {
            cartQuantityErrorArray.push({
              message:
                "This item is no longer available. Please remove it from your cart",
              type: "remove",
              productId: item.productId,
              price: productQuantity.price,
              name: productQuantity.name,
              quantity: productQuantity?.stockQuantity,
              image: productQuantity?.image
            });
          } else {
            cartQuantityErrorArray.push({
              message:
                `Please update the quantity of the item as there has been a change in stock. Quantity left in stock: ${productQuantity?.stockQuantity}`,
              type: "update",
              productId: item.productId,
              price: productQuantity?.price ?? 0,
              name: productQuantity?.name ?? "",
              quantity: productQuantity?.stockQuantity ?? 0,
              image: productQuantity?.image ?? ""
            });
          }
        }
      })
    );

    let totalCostBeforeTax = 0;

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
      totalCostBeforeTax = totalCostBeforeTaxNumber;
    }

    let buttonDisable = true;
    if (cart?.length > 0 && (cartQuantityErrorArray && cartQuantityErrorArray.length == 0) && +totalCostBeforeTax >=35){
      buttonDisable = false;
    }

    //when all the loops are done
    res.json({
      ok: true,
      data: cartArray,
      cartQuantityErrorArray,
      buttonDisable
    });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);
