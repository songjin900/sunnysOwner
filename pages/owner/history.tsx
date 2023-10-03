import { NextPage } from "next";
import Layout from "@components/layout";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { BillingAddress, Order, OrderItem, Product, ShippingAddress } from "@prisma/client";
import Link from "next/link";
import DropDown from "@components/dropdown";
import useMutation from "@libs/client/useMutation";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

interface ProductWithOrderItem extends OrderItem {
    product: Product
}

interface AddressOrderItemWithOrder extends Order {
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    orderItem: ProductWithOrderItem[],
}

interface HistoryMutationResponse {
    ok: boolean,
    order: AddressOrderItemWithOrder[]
}

const AllHistory: NextPage = () => {
    const router = useRouter();
    const { data } = useSWR<HistoryMutationResponse>(`/api/owner/history`);
    const [history, setHistory] = useState<AddressOrderItemWithOrder[]>([]);
    const [orderId, setOrderId] = useState(-1);
    const [updateStatus, { loading: statusLoading, data: statusData }] = useMutation<HistoryMutationResponse>(`/api/owner/history`);
    const today = new Date();

    const onDatePickerChange = (date: Date) => {
        updateStatus({ orderId, deliveryDate: date });
        if (history) {
            const index = history?.findIndex(order => order.id === orderId);
            // 
            if (index !== -1) {
                const updatedHistory = [
                    ...history.slice(0, index), // all items before the updated item
                    { ...history[index], deliveryDate: date }, // the updated item
                    ...history.slice(index + 1) // all items after the updated item
                ];

                // Update the state with the new array of items
                setHistory(updatedHistory);
            }
        }
    }

    const handleStatusSelect = (status: { name: string; id: number }) => {
        //Post Request
        updateStatus({ orderId, deliveryStatus: status.name });

        if (history) {
            const index = history?.findIndex(order => order.id === orderId);
            // 
            if (index !== -1) {
                const updatedHistory = [
                    ...history.slice(0, index), // all items before the updated item
                    { ...history[index], deliveryStatus: status.name }, // the updated item
                    ...history.slice(index + 1) // all items after the updated item
                ];

                // Update the state with the new array of items
                setHistory(updatedHistory);
            }
        }
    };

    const statusWithTimeSwitch = (status: string, deliveryDate: Date) => {
        switch (status) {
            case 'Delivery Scheduled':
                return <div>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(deliveryDate))} between 6-9pm</div>
            case 'Delivery Complete':
                return <div>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(deliveryDate))}</div>
            default:
                return null
        }
    }

    //Initial
    useEffect(() => {
        if (data) {
            setHistory(data.order);
        }
    }, [data])

    return (
        <Layout title="History" hasTabBar>
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <div className="flex flex-col md:flex-row md:space-x-4 justify-center">
                    <div className="w-full md:min-w-[30rem] md:max-w-[50rem]">
                        {
                            data ?
                                (
                                    history?.map((order) => (
                                        <div key={order.id} className="border-2 rounded-xl space-x-4 bg-white mb-3 p-1">
                                            <div className="grid grid-cols-6 grid-rows-1 bg-gray-200 p-1 rounded-xl">
                                                <div className="grid grid-rows-2 col-span-2"><div>Order Placed</div>
                                                    <div>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(new Date(order.orderPlacedDate))}</div>
                                                </div>
                                                <div className="grid grid-rows-2">
                                                    <div>Total</div>
                                                    <div>{Number(order.totalCostAfterTax)} </div>
                                                </div>
                                                <div className="grid grid-rows-2">
                                                    <div>Ship To</div>
                                                    <div>{order.shippingAddress.firstName} </div>
                                                </div>
                                                <div className="grid grid-rows-2">
                                                    <div>Order</div>
                                                    <div>{order.orderNumber} </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <Link legacyBehavior href={`/order/${order.id}/invoice`}>
                                                        <div className="underline cursor-pointer">Invoice</div>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex justify-between m-2" onClick={() => { setOrderId(order.id) }}>
                                                <div className="p-1 text-lg">
                                                    Status: {order.deliveryStatus}
                                                    {statusWithTimeSwitch(order.deliveryStatus ?? "", order?.deliveryDate ?? today)}
                                                </div>
                                                <div className="flex">
                                                    {
                                                        orderId === order.id && (order.deliveryStatus === "Delivery Scheduled" || order.deliveryStatus === "Delivery Complete") ?
                                                            <div>
                                                                <DatePicker
                                                                    selected={new Date(order.deliveryDate ?? today)}
                                                                    onChange={(date: Date | null) => onDatePickerChange(date ?? today)}
                                                                    className="w-32 text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                                                                    dateFormat="MMM/dd/yyyy" />
                                                            </div>
                                                            : null
                                                    }
                                                    <DropDown
                                                        dropdownArray={[
                                                            { id: 0, name: "Preparing", },
                                                            // { id: 1, name: "Delivery Scheduled" },
                                                            { id: 2, name: "Delivery Complete" },
                                                            // { id: 3, name: "Ready To Pickup" },
                                                            // { id: 4, name: "Pickup Complete" },
                                                            { id: 5, name: "Canceled" },
                                                            { id: 6, name: "Refunded" },

                                                        ]}
                                                        onStatusSelect={handleStatusSelect}
                                                    />
                                                </div>
                                            </div>
                                            <>
                                                {/* <DatePicker
                                                    selected={selectedDate}
                                                    onChange={(date: Date | null) => setSelectedDate(date)}
                                                    className="w-32 text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="Select date"
                                                    dateFormat="MMM/dd/yyyy"
                                                /> */}
                                            </>
                                 

                                            {order?.orderItem?.map((item) => (
                                                <div key={item.id} className="flex flex-col border-2 rounded-xl p-1 hover:border-orange-400 cursor-pointer ">
                                                    <Link legacyBehavior href={`/products/${item.product.id ?? 1}`}>
                                                        <div className="flex flex-row space-x-4">
                                                            {item?.product?.image ?
                                                                <Image
                                                                    width={150}
                                                                    height={150}
                                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${item.product.image}/smallimage`}
                                                                    className="bg-white" alt={""} />
                                                                :
                                                                null
                                                            }
                                                            <div className="">
                                                                <span className="text-lg font-md text-gray-800">{item?.product?.name}</span>
                                                                <div className="flex flex-col md:mt-2 ">
                                                                    <span className="text-sm text-gray-500">${item?.product?.price}</span>
                                                                    <span className="text-sm text-gray-500">Quantity {item?.quantity}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )
                                : null
                        }
                    </div>
                </div>
            </div >
        </Layout>
    )
}

export default AllHistory;