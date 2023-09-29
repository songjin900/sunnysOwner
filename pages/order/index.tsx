import type { NextPage } from "next";
import Button from "@components/button";
import Input from "@components/input";
import Layout from "@components/layout";
import { useForm } from "react-hook-form";
import useMutation from "@libs/client/useMutation";
import { useEffect, useRef, useState } from "react";
import { BillingAddress, Cart, Order, Product, ShippingAddress, User } from "@prisma/client";
import { useRouter } from "next/router";
import useSWR from "swr"
import Image from "next/image";
import LoadingAnimation from "@components/loadingAnimation";
import Link from "next/link";
import { checkout } from "@libs/client/checkout";
import { withSsrSession } from "@libs/server/withSession";
import client from "@libs/server/client";
import { ShippingCostCalculator } from "@libs/client/shippingCostCalculator";
import { getContact } from "@libs/client/contact";

type validateQuantity = {
  message: string;
  type: "update" | "remove";
  productId: number;
}

interface deliveryDate {
  deliveryDate: Date,
  deliveryDateDisplay: string,
  dateIndex: number,
  availability: boolean
}

interface validateQuantityResponse {
  cartQuantityErrorArray: any;
  ok: boolean
  validateQuantity: validateQuantity[]
}

interface UserDetailForm {
  email?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  city?: string;
  province?: string;
  postCode?: string;
  firstNameB?: string;
  lastNameB?: string;
  addressB?: string;
  phoneB?: string;
  cityB?: string;
  provinceB?: string;
  postCodeB?: string;
  method?: string;
}

interface AddressWithOrder extends Order {
  shippingAddress: ShippingAddress,
  billingAddress: BillingAddress

}

interface orderResponse {
  ok: boolean,
  order: AddressWithOrder,
}

interface ProductWithCart extends Cart {
  product: Product
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Checkout: NextPage<{ cart: ProductWithCart[]; totalCostBeforeTax: string; totalCostAfterTax: string; tax: string; shipping: string; }> = ({ cart, totalCostBeforeTax, totalCostAfterTax, tax, shipping }) => {
  const router = useRouter();
  const { data: user, error } = useSWR("/api/users/me");
  const { data: orderData, isValidating: orderIsValidating } = useSWR<orderResponse>(typeof window === "undefined" ? null : `/api/order`);
  const { data: validateQuantityData } = useSWR<validateQuantityResponse>(`/api/order/validateQuantity`);

  const [updateAddresses, { loading, data: addressData }] = useMutation("/api/order/address")
  const [updateSameAddress, { loading: sameAddressLoading, data: sameAddressData }] = useMutation("/api/order")
  const [updatePreOrder, { loading: preOrderLoading, data: preOrderData }] = useMutation("/api/preorder")

  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<UserDetailForm>();

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryDayIndex, setDeliveryDayIndex] = useState<number>();
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const divRefDeliveryDate = useRef<HTMLDivElement>(null);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

  useEffect(() => {
    if (orderData?.order?.shippingAddress?.firstName) setValue("firstName", orderData?.order?.shippingAddress?.firstName);
    if (orderData?.order?.shippingAddress?.lastName) setValue("lastName", orderData?.order?.shippingAddress?.lastName);
    if (orderData?.order?.shippingAddress?.phone) setValue("phone", orderData?.order?.shippingAddress?.phone);
    if (orderData?.order?.shippingAddress?.address) setValue("address", orderData?.order?.shippingAddress?.address);
    if (orderData?.order?.shippingAddress?.city) setValue("city", orderData?.order?.shippingAddress?.city);
    if (orderData?.order?.shippingAddress?.province) setValue("province", orderData?.order?.shippingAddress?.province);
    if (orderData?.order?.shippingAddress?.postCode) setValue("postCode", orderData?.order?.shippingAddress?.postCode);

  }, [orderData?.order?.shippingAddress, setValue])

  useEffect(() => {
    if (orderData?.order?.billingAddress?.firstName) setValue("firstNameB", orderData?.order?.billingAddress?.firstName);
    if (orderData?.order?.billingAddress?.lastName) setValue("lastNameB", orderData?.order?.billingAddress?.lastName);
    if (orderData?.order?.billingAddress?.phone) setValue("phoneB", orderData?.order?.billingAddress?.phone);
    if (orderData?.order?.billingAddress?.address) setValue("addressB", orderData?.order?.billingAddress?.address);
    if (orderData?.order?.billingAddress?.city) setValue("cityB", orderData?.order?.billingAddress?.city);
    if (orderData?.order?.billingAddress?.province) setValue("provinceB", orderData?.order?.billingAddress?.province);
    if (orderData?.order?.billingAddress?.postCode) setValue("postCodeB", orderData?.order?.billingAddress?.postCode);

  }, [orderData?.order?.billingAddress, setValue])

  useEffect(() => {
    setUseSameAddress(orderData?.order?.useSameAddress && orderData?.order?.useSameAddress === true ? true : false)
  }, [orderData?.order?.useSameAddress])

  const onValid = ({ email, firstName, lastName, address, city, province, postCode, phone, firstNameB, lastNameB, addressB, cityB, provinceB, postCodeB, phoneB }: UserDetailForm) => {

    if (loading)
      return;

    if (deliveryDayIndex != 0 && !deliveryDayIndex) {
      setShowDeliveryError(true);
      scrollToDiv();
      return
    }

    if (email && !isValidEmail(email)) {
      setError("email", { message: "Invalid Email. Please try again" });
      return; // Added return statement to stop execution after setting the error
    }
    try {

      updateAddresses({
        firstName, lastName, address, city, province, postCode, phone,
        firstNameB, lastNameB, addressB, cityB, provinceB, postCodeB, phoneB, email, deliveryDayIndex
      })

      if (validateQuantityData?.ok === false) {
        router.replace(`/cart`);
        return;
      }
    }
    catch (err) {
      console.log("error occured")
    }
  }

  const onCheckboxClicked = () => {
    updateSameAddress({ useSameAddress: !useSameAddress });
    setUseSameAddress(prev => !prev);
  }

  useEffect(() => {
    if (validateQuantityData && validateQuantityData.ok && addressData?.ok && Number(totalCostAfterTax) > 0) {
      updatePreOrder({});
      checkout(totalCostAfterTax);
    }
  }, [addressData]) //just don't put more dependencies.

  useEffect(() => {
    if (user) {
      setValue('email', user?.profile?.email);
      setValue('city', "London");
      setValue('province', "Ontario");
    }
  }, [setValue, user])

  const today = new Date()
  const tomorrow = new Date();
  const dayAfterTmr = new Date();
  const twoDaysAfterTmr = new Date();

  tomorrow.setDate(today.getDate() + 1)
  dayAfterTmr.setDate(today.getDate() + 2)
  twoDaysAfterTmr.setDate(today.getDate() + 3)

  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();

    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = weekday[date.getDay()];

    return `${dayName} ${month} ${day}`;
  }

  //time now
  const hour = today.getHours();

  const dateArray: deliveryDate[] = [
    {
      deliveryDate: today,
      deliveryDateDisplay: formatDate(today),
      dateIndex: 0,
      availability: hour < 15 ? true : false
    },
    {
      deliveryDate: tomorrow,
      deliveryDateDisplay: `${formatDate(tomorrow)}`,
      dateIndex: 1,
      availability: true
    },
    {
      deliveryDate: dayAfterTmr,
      deliveryDateDisplay: formatDate(dayAfterTmr),
      dateIndex: 2,
      availability: true
    },
    {
      deliveryDate: twoDaysAfterTmr,
      deliveryDateDisplay: formatDate(twoDaysAfterTmr),
      dateIndex: 3,
      availability: true
    },
  ]

  const scrollToDiv = () => {
    if (divRefDeliveryDate.current)
      divRefDeliveryDate.current.scrollIntoView({ behavior: 'smooth' })
  };

  useEffect(() => {
    if (loading || orderIsValidating || !orderData)
      setShowLoadingAnimation(true)
    else
      setShowLoadingAnimation(false)
  }, [orderIsValidating, orderData, loading])

  useEffect(() => {
    if (cart.length === 0) {
      router.replace('/shop')
    }
  }, [cart, router])



console.log(hour);

  return (
    <Layout canGoBack title="Order">
      <LoadingAnimation showLoadingAnimation={showLoadingAnimation} />
      <div className={`px-4 md:px-20 py-4 bg-white w-full ${showLoadingAnimation ? "opacity-30" : "opacity-100"}`}>
        <form className="p-4 space-y-4 max-w-full" onSubmit={handleSubmit(onValid)}>
          <div className="flex flex-col md:flex-row md:space-x-10 justify-center">
            <div className="w-full md:max-w-[50rem] flex flex-col just">
              <div className="w-full flex flex-col space-y-2 pb-2 border-b-2">
                <Link legacyBehavior href={`/cart`}>
                  <button className="px-2 py-1 rounded-2xl my-1 border-dashed border-2 w-44">
                    <div className="flex gap-x-2 items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                      </svg>
                      Back to Cart
                    </div>
                  </button>
                </Link>
                <span className="text-lg font-medium flex mb-5" >Your Details</span>
                <div className="flex flex-col py-2">
                  {
                    errors?.email?.message ?
                      <div className="text-red-600 text-lg flex my-2">{errors?.email?.message}</div>
                      : null
                  }
                  <div className="flex items-end gap-x-3">
                    <div className="w-96">
                      <Input register={register("email", { required: true })} required label="Email*" name="" type="email" disabled={!editEmail} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-7 h-7 mb-2 text-gray-500 cursor-pointer ${editEmail ? 'hidden' : 'block'}`} onClick={() => setEditEmail(true)} >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <div className={`text-sm sm:mb-2 ${editEmail ? 'hidden' : 'block'}`}>Click here to edit</div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-7 h-7 mb-2 text-gray-500 cursor-pointer ${!editEmail ? 'hidden' : 'block'}`} onClick={() => setEditEmail(false)}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-lg font-medium flex my-5" >Shipping</span>
              <div className="flex flex-col md:flex-row md:space-x-4 py-3 space-y-3 md:space-y-0">
                <Input register={register("firstName", { required: true })} required label="First Name*" name="firstName" type="text" />
                <Input register={register("lastName", { required: true })} required label="Last Name*" name="lastName" type="text" />
              </div>
              <Input register={register("address", { required: true })} required label="Address*" name="address" type="text" />
              <div className="flex flex-col md:flex-row gap-x-4 py-3 space-y-3 md:space-y-0">
                <Input register={register("city", { required: true })} required label="City*" name="name" type="city" disabled={true} />
                <div className="flex space-x-4">
                  <Input register={register("province", { required: true })} required label="Province*" name="province" type="text" disabled={true} />
                  <Input register={register("postCode", { required: true })} required label="Postal Code*" name="postCode" type="text" />
                </div>
              </div>
              <div className="flex">
                <Input register={register("phone", { required: true })} required label="Phone*" name="phone" type="text" />
              </div>

              <div className="flex flex-col w-full border-t-2 border-b-2 max-w-[40rem] py-4 my-4">
                <div className="flex flex-col">
                  <div ref={divRefDeliveryDate} className="text-lg flex py-4">Delivery Date</div>
                  <div className={`text-sm ${hour < 15 ? "block": "hidden"}`}>Please be aware that same-day delivery cannot be guaranteed. For inquiries, contact us via email at {getContact().businessEmail} or text {getContact().businessPhone}. To secure same-day delivery, orders must be placed by 3 pm. If the product is unavailable on the same day for any reason, delivery will occur the following day</div>
                  <div className="pl-4 text-orange-600 text-sm">{showDeliveryError ? "Please pick a delivery date" : ""}</div>
                </div>
                <div className="flex flex-row space-x-3 mt-2">
                  {
                    dateArray
                      .slice(0)
                      .sort((a, b) => a.dateIndex > b.dateIndex ? +1 : -1)
                      .filter((day)=>day.availability === true)
                      .map((day) => (
                        <div key={day.dateIndex}>
                          <div onClick={() => { setDeliveryDayIndex(day.dateIndex); setShowDeliveryError(false) }}
                            className={`cursor-pointer bg-gray-200 text-gray-700 border-2 p-3 rounded-2xl text-center text-xs md:text-base
                          ${day.dateIndex === deliveryDayIndex ? "bg-green-300" : "bg-gray-200"}`}>
                            {day.deliveryDateDisplay}
                            <br />
                            6-9PM
                          </div>
                        </div>
                      ))
                  }
                </div>
              </div>

              <div className="w-full max-w-[40rem]">
                <span className="text-lg flex py-4">Billing Address</span>
                <div className="flex items-center mb-4 pl-2 pt-1">
                  <input type="checkbox" onChange={() => onCheckboxClicked()} checked={useSameAddress} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Same as shipping address</label>
                </div>
              </div>
              <div className={`${useSameAddress ? `hidden` : `block`}`}>
                <div className="flex flex-col md:flex-row md:gap-x-4 py-3 ">
                  <Input register={register("firstNameB", { required: !useSameAddress })} label="First Name" name="firstNameB" type="text" required={!useSameAddress} />
                  <Input register={register("lastNameB", { required: !useSameAddress })} label="Last Name" name="lastNameB" type="text" required={!useSameAddress} />
                </div>
                <Input register={register("addressB", { required: !useSameAddress })} label="Address" name="addressB" type="text" required={!useSameAddress} />
                <div className="flex flex-col md:flex-row gap-x-4 py-3">
                  <Input register={register("cityB", { required: !useSameAddress })} label="City" name="cityB" type="city" required={!useSameAddress} />
                  <div className="flex gap-x-4">
                    <Input register={register("provinceB", { required: !useSameAddress })} label="Province" name="provinceB" type="text" required={!useSameAddress} />
                    <Input register={register("postCodeB", { required: !useSameAddress })} label="Postal Code" name="postCodeB" type="text" required={!useSameAddress} />
                  </div>
                </div>
                <div className="flex py-3">
                  <Input register={register("phoneB", { required: !useSameAddress })} label="Phone" name="phoneB" type="text" required={!useSameAddress} />
                </div>
              </div>
            </div>
            <div className="flex flex-col min-w-[20rem] md:max-w-sm w-full mt-10">
              <span>Order Summary</span>
              <div className="overflow-auto max-h-[35rem] min-h-[20rem] mb-4 p-2">
                <>
                  {cart.map((record) => (
                    <div key={record.id} className="cursor-pointer border-y-2 border-gray-100 bg-[#F4F4F4] rounded-2xl flex mb-1">
                      <div className="flex flex-row space-x-2 pl-1 my-1 w-full">
                        <Image
                          width={120}
                          height={120}
                          src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${record.product.image}/smallimage`}
                          className=" bg-[#F4F4F4] rounded-2xl"
                          alt=""
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex justify-between p-2">
                            <span className="text-lg font-md text-gray-800">{record.product.name}</span>
                            <span className="text-sm text-gray-500 flex items-center">${record.product.price}</span>
                          </div>
                          <div className="flex flex-col md:mt-2 p-2">
                            <span className="text-sm text-gray-500">{record.product.modelNumber}</span>
                            <span className="text-sm text-gray-500">Quantity: {record.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              </div>
              <div className="flex flex-col border-t-2 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">{totalCostBeforeTax}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm">{shipping}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm">Tax</span>
                  <span className="text-sm">{tax}</span>
                </div>
                <div className="flex justify-between border-t-2 pt-2">
                  <span className="text-sm">Order Total</span>
                  <span className="text-sm">{totalCostAfterTax}</span>
                </div>
              </div>
              {
                +totalCostBeforeTax >= 35 ?
                  (
                    <div className="flex flex-col mt-10">
                      <div className="flex items-center mb-4 pl-2 pt-1">
                        <input type="checkbox" required className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <div className="flex flex-row">
                          <label className="ml-2 text-sm font-medium text-gray-900">I agree to</label>
                          <Link legacyBehavior href={`/terms`}>
                            <label className="ml-1 text-sm font-medium text-blue-600 cursor-pointer underline">
                              TERMS AND CONDITIONS
                            </label>
                          </Link>
                        </div>
                      </div>
                      <Button text={"Proceed to Checkout"} />
                    </div>
                  )
                  :
                  (
                    <label className="ml-1 text-sm mt-10">
                      Please note that the minimum order must equal or greater than $35 before HST
                    </label>
                  )
              }
            </div>
          </div>
        </form>
      </div >
    </Layout >
  );
};

export const getServerSideProps = withSsrSession(async function (context: { req: { session: { user: { id: any; } }; }; }) {

  try {
    if (!context.req.session.user?.id) {
      throw new Error("User not found")
    }

    const userId = context.req.session.user?.id;

    const cart = await client.cart.findMany({
      where: {
        userId: userId,
      },
      include: {
        product: true,
      },
    });

    let totalCostBeforeTax = "";
    let totalCostAfterTax = "";
    let tax = "";
    let shipping = "";

    if (cart.length > 0) {
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
      const taxNumber = (totalCostBeforeTaxNumber + +shippingCost) * 0.13;
      const totalCostAfterTaxNumber = totalCostBeforeTaxNumber + +shippingCost + taxNumber;

      totalCostBeforeTax = totalCostBeforeTaxNumber.toFixed(2);
      totalCostAfterTax = totalCostAfterTaxNumber.toFixed(2);
      tax = taxNumber.toFixed(2);
      shipping = shippingCost.toFixed(2).toString()
    }

    return {
      props: {
        cart: JSON.parse(JSON.stringify(cart)),
        totalCostBeforeTax,
        totalCostAfterTax,
        tax,
        shipping,
      }
    }
  }
  catch (err) {
    console.log(err);
  }
});

export default Checkout;