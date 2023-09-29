import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextPage, NextPageContext } from 'next';
import { withSsrSession } from '@libs/server/withSession';
import Layout from '@components/layout';
import { createOrder } from '@libs/client/createOrder';
const stripeClient = require('stripe')(process.env.STRIPE_SECRET_KEY);
import client from "@libs/server/client";
import { saveStripeInformation } from '@libs/client/saveStripeInformation';
import { sendEmail } from '@libs/client/sendEmail';
import { emailBody } from '@libs/client/emailBody';

export interface OrderDataResponse {
  ok: boolean;
  orderNumber: string;
  orderId: string;
}

const CheckoutSuccessPage: NextPage<{ ok: boolean; orderId: number }> = ({ ok, orderId }) => {

  const router = useRouter();

  useEffect(() => {
    if (ok) {
      router.replace(`/order/${orderId}/invoice`);
    }
    else {
      router.replace(`/`)
    }
  }, [ok, orderId, router])

  return (
    <Layout title="Invoice" hasTabBar>
      <div className='flex w-full justify-center items-center text-xl'>
        Loading... please do not refresh the page
      </div>
    </Layout>
  )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { sessionId: any; }; req: { session: { user: { id: any; } }; }; }) {

  try {
    const { sessionId } = context.query;
    const { id } = context?.req?.session.user;

    if (sessionId && !sessionId.toString().startsWith('cs_')) {
      throw Error('Incorrect Checkout Session ID.')
    }

    try {
      //Create ordery
      const responseData = await createOrder(id);

      const userEmail = await client.user.findUnique({
        where: {
          id
        },
        select: {
          email: true
        }
      })

      const order = await client.order.findUnique({
        where: {
          id: Number(responseData.orderId),
        },
        include: {
          billingAddress: true,
          shippingAddress: true,
          orderItem: {
            include: {
              product: true,
            },
          },
        },
      });

      const orderItem = await client.orderItem.findMany({
        where: {
          orderId: Number(responseData.orderId)
        },
        select: {
          product: true,
          productId: true,
          quantity: true
        }
      })

      const orderItemBody = orderItem.map((item) => {
        const price = item && item.product ? item.product.price : 0;
        const subTotal = (item.quantity ?? 0) * price;

        return `<tr>
          <td>${item.productId}</td>
          <td>${item.product?.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.product?.price}</td>
          <td>$${subTotal > 0 ? subTotal : "undefined"}</td>
        </tr>`;
      }).join(' ');


      const customerFullName = order?.shippingAddress?.firstName + ", " + order?.shippingAddress?.lastName;
      const totalCostAfterTax = order && order.totalCostAfterTax ? order.totalCostAfterTax.toString() : ""

      const ebody = (await emailBody(order?.orderNumber ?? "",
        customerFullName,
        new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(order?.orderPlacedDate),
        totalCostAfterTax,
        order?.shippingAddress?.address ?? "",
        order?.shippingAddress?.city ?? "",
        order?.shippingAddress?.province ?? "",
        order?.shippingAddress?.postCode ?? "",
        orderItemBody
      )
      ).toString();

      let sentSuccessful = true;
      // Wrap the sendEmail calls in Promise.all
      try {
        await Promise.all([
          sendEmail(process.env.EMAIL_USER as string, `NEW ORDER #${responseData.orderId}`, ebody),
          userEmail && userEmail.email ? sendEmail(userEmail.email, `Confirmation of your Order #${responseData.orderNumber}`, ebody) : null,
        ]);
      }
      catch (err: any) {
        const errorLog = await client.errorLog.create({
          data: {
            errorPage: "/success/tsx-sendEmail-ToOwnerAndCustomer",
            errorMessage: err.message ?? "",
          },
        });
        sentSuccessful = false;
      }

      if (!sentSuccessful){
        try{
          sendEmail(process.env.EMAIL_USER as string, `Sending Email Failed: ORDER ID #${responseData.orderId}`, ebody)
        }
        catch(err:any){
          const errorLog = await client.errorLog.create({
            data: {
              errorPage: "/success/tsx-sendEmail-EmailSentFailure",
              errorMessage: err.message ?? "",
            },
          });
        }
      }

      try {
        const checkoutSession = await stripeClient.checkout.sessions.retrieve(sessionId, {
          expand: ['payment_intent', 'line_items.data.price.product'],
        })

        const { id: csID, amount_total, customer_details, payment_status } = checkoutSession;
        const { address, email, name, phone } = customer_details;
        const { city, country, line1, line2, postal_code, state } = address || {};
        const { id: piId, amount_received, client_secret, payment_method } = checkoutSession.payment_intent || {};

        await saveStripeInformation(
          responseData.orderId,
          csID || "",
          amount_total || 0,
          city || "",
          country || "",
          line1 || "",
          line2 || "",
          postal_code || "",
          state || "",
          email || "",
          name || "",
          phone || "",
          piId || "",
          amount_received || 0,
          client_secret || "",
          payment_method || "",
          payment_status || ""
        );
      }
      catch (err: any) {
        const errorLog = await client.errorLog.create({
          data: {
            errorPage: "/success/tsx-saveStripeInformation",
            errorMessage: err.message ?? "",
          },
        });
      }

      return {
        props: {
          ok: JSON.parse(JSON.stringify(responseData.ok)),
          orderId: JSON.parse(JSON.stringify(responseData.orderId))
        }
      }
    }
    catch (err: any) {
      const errorLog = await client.errorLog.create({
        data: {
          errorPage: "/success/tsx",
          errorMessage: err.message ?? "",
        },
      });
      return {
        props: {
          ok: false,
          orderId: -1
        }
      }

    }
  } catch (err: any) {
    const errorLog = await client.errorLog.create({
      data: {
        errorPage: "/success/tsx",
        errorMessage: err.message ?? "",
      },
    });
    const errorMessage = err instanceof Error ? err.message : 'Internal server error'
  }
})

export default CheckoutSuccessPage
