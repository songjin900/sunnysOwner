import { BillingAddress, Order, OrderItem, Product, ShippingAddress } from "@prisma/client";
import Image from "next/image";

interface productWithOrderItem extends OrderItem {
    product: Product
}

interface OrderResponse extends Order {
    billingAddress: BillingAddress,
    shippingAddress: ShippingAddress,
    orderItem: productWithOrderItem[]
}

interface OrderProps {
    order: OrderResponse,
    ok: boolean
}

export default function InvoicePDF({
    order, ok
}: OrderProps) {
    const today = new Date();
    return (
        <div className="w-[46rem] bg-white" id="InvoicePDFDiv">
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
                                                        <div>${order.totalCostAfterTax ? Number(order.totalCostAfterTax).toFixed(2) : ''}</div>
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
                                                <div className="flex justify-center m-2 text-md">
                                                    Note: {order.note ?? ""}
                                                </div>
                                                <div className="flex justify-center m-2 text-xl">Products</div>
                                                {order.orderItem.map((orderItem) => (
                                                    <div key={orderItem.id} className="flex flex-col border-2 rounded-xl p-1 hover:border-green-400 cursor-pointer ">
                                                            <div className="flex flex-row space-x-4">
                                                                {/* <Image
                                                                    height={50}
                                                                    width={50}

                                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${orderItem?.product.image}/smallimage`}
                                                                    className="bg-[#F4F4F4] rounded-2xl"
                                                                    alt=""
                                                                /> */}
                                                                <div className="">
                                                                    <span className="text-lg font-md text-gray-800">{orderItem.product?.name}, Product #{orderItem.productId}</span>
                                                                    <div className="flex flex-col md:mt-2 ">
                                                                        <span className="text-sm text-gray-500">${orderItem?.product?.price}</span>
                                                                        <span className="text-sm text-gray-500">Quantity: {orderItem?.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
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
    )
}
