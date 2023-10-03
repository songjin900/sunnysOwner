import { NextPage } from "next";
import Layout from "@components/layout";
import { useRouter } from "next/router";
import Link from "next/link";
import { BillingAddress, Order, OrderItem, Product, ShippingAddress } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import client from "@libs/server/client";
import { withSsrSession } from "@libs/server/withSession";
import jsPDF from 'jspdf';
import InvoicePDF from "@components/invoicePDF";

interface productWithOrderItem extends OrderItem {
    product: Product
}

interface OrderResponse extends Order {
    billingAddress: BillingAddress,
    shippingAddress: ShippingAddress,
    orderItem: productWithOrderItem[]
}

const Invoice: NextPage<{ ok: boolean; order: OrderResponse }> = ({ ok, order }) => {
    const today = new Date();
    const router = useRouter()

    const handleGeneratePDF = () => {
        const pdf = new jsPDF('p', 'px', [735, 950]); //width height
        const content = document.getElementById('InvoicePDFDiv');

        const pdfName = "SunnysFlowersInvoice" + order.id + ".pdf";

        if (content) {
            pdf.html(content, {
                callback: function (pdfToSave) {
                    pdfToSave.save(pdfName)
                }
            });
        }
    };

    useEffect(() => {
        if (!ok) {
            router.replace("/");
        }
    }, [ok, router])

    const onDownloadButtonClick = () => {
        handleGeneratePDF();
    }

    return (
        <Layout title="Invoice" hasTabBar>
            <div className="hidden">
                <InvoicePDF order={order} ok={ok} />
            </div>
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <div className="flex justify-center my-2">
                    <button onClick={onDownloadButtonClick} className="bg-green-500 rounded-2xl p-2">
                        <div className="flex space-x-2 px-2">
                            Download as PDF
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                    </button>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 justify-center">
                    <div className="w-full md:min-w-[30rem] md:max-w-[50rem] bg-white">
                        {
                            !ok ? <div>Loading...</div> :
                                <>
                                    {
                                        order.status !== 'complete' ? <div>  Loading... </div> :
                                            <div className="p-2">
                                                <div className="flex justify-center text-2xl m-4">Sunny&apos;s Flowers</div>
                                                <div className="flex justify-center text-2xl m-4">Order#: {order.orderNumber}</div>
                                                <div className="grid grid-cols-2 grid-rows-1 rounded-xl border-2 p-2">
                                                    <div className="">
                                                        <div className="font-bold text-lg">Date Placed</div>
                                                        <div>Order Total</div>
                                                        <div>Status</div>
                                                    </div>
                                                    <div className="">
                                                        <div>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(order?.orderPlacedDate ?? today))}</div>
                                                        <div>{Number(order.totalCostAfterTax)}</div>
                                                        <div>{order.deliveryStatus}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 grid-rows-2 rounded-xl border-2 p-2 mt-2">
                                                    <div className="">
                                                        <div className="font-bold text-lg">Payment Method</div>
                                                        <div>{order.paymentType}</div>
                                                    </div>
                                                    <div className="">
                                                        <div className="font-bold text-lg">Estimated Shipping Schedule</div>
                                                        <div>
                                                            {order.deliveryDate ? (
                                                                <div>
                                                                    {new Intl.DateTimeFormat('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: '2-digit',
                                                                    }).format(new Date(order.deliveryDate))}
                                                                    &nbsp;between 6-9pm
                                                                </div>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="">
                                                        <div className="font-bold text-lg">Billing Address</div>
                                                        <div>Name: {order.billingAddress?.firstName} {order.billingAddress?.lastName} </div>
                                                        <div>Address: {order.billingAddress?.address},</div>
                                                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            {order.billingAddress?.city}, {order.billingAddress?.province}, {order.billingAddress?.postCode}</div>
                                                        <div>Phone: {order.billingAddress?.phone}</div>
                                                    </div>
                                                    <div className="">
                                                        <div className="font-bold text-lg">Shipping Address</div>
                                                        <div>Name: {order.shippingAddress?.firstName} {order.shippingAddress?.lastName} </div>
                                                        <div>Address: {order.shippingAddress?.address}, </div>
                                                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            {order.shippingAddress?.city}, {order.shippingAddress?.province}, {order.shippingAddress?.postCode}</div>
                                                        <div>Phone: {order.shippingAddress?.phone}</div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center m-2 text-xl">Items</div>
                                                {order.orderItem.map((orderItem) => (
                                                    <div key={orderItem.id} className="flex flex-col border-2 rounded-xl p-1 hover:border-green-400 cursor-pointer ">
                                                        <Link legacyBehavior href={`/products/${orderItem.productId}`}>
                                                            <div className="flex flex-row space-x-4">
                                                                <Image
                                                                    height={50}
                                                                    width={50}

                                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${orderItem?.product.image}/smallimage`}
                                                                    className="bg-[#F4F4F4] rounded-2xl"
                                                                    alt=""
                                                                />
                                                                <div className="">
                                                                    <span className="text-lg font-md text-gray-800">{orderItem.product?.name}, Product #{orderItem.productId}</span>
                                                                    <div className="flex flex-col md:mt-2 ">
                                                                        <span className="text-sm text-gray-500">${orderItem?.product?.price}</span>
                                                                        <span className="text-sm text-gray-500">Quantity: {orderItem?.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ))}
                                                <div className="mt-4">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            Subtotal
                                                        </div>
                                                        <div>
                                                            ${order.totalCostBeforeTax ? Number(order.totalCostBeforeTax).toFixed(2) : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div>
                                                            Shipping
                                                        </div>
                                                        <div>
                                                            ${order.shipping ? Number(order.shipping).toFixed(2) : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div>
                                                            Tax
                                                        </div>
                                                        <div>
                                                            ${order.tax ? Number(order.tax).toFixed(2) : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between border-t-2 mt-2 pt-2">
                                                        <div>
                                                            Order Total
                                                        </div>
                                                        <div>
                                                            ${order.totalCostAfterTax ? Number(order.totalCostAfterTax).toFixed(2) : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    }
                                </>
                        }
                    </div>
                </div>
            </div >
        </Layout>
    )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { id: any; }; req: { session: { user: { id: any; } }; }; }) {

    try {
        const { id } = context.query;

        //Good
        const order = await client.order.findFirst({
            where: {
                id: Number(id),
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

        return {
            props: {
                ok: order ? true : false,
                order: order ? JSON.parse(JSON.stringify(order)) : null,
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});

export default Invoice;
