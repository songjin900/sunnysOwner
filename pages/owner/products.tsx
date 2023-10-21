import Layout from "@components/layout";
import { NextApiRequest, NextPage } from "next";
import Link from "next/link";
import useMutation from "@libs/client/useMutation";
import { useForm } from "react-hook-form";
import Input from "@components/input";
import { useEffect, useRef, useState } from "react";
import Checkmark from "@components/checkmark";
import Image from "next/image";
import { EventDays } from "@prisma/client";
import { useRouter } from 'next/router';
import client from "@libs/server/client";
import { withSsrSession } from "@libs/server/withSession";
import LoadingAnimation from "@components/loadingAnimation";

interface productEventDayId {
    eventDaysId: string
}

interface products {
    id: number,
    name: string,
    localImage: string,
    price: number,
    stockQuantity: number,
    image: string,
    productEventDay: productEventDayId[],
    description: string
    size: string
}

interface productForm {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    eventDay: string[];
    description: string;
    size: string;
}

const Products: NextPage<{ products: products[]; eventDays: EventDays[], isLogin: boolean }> = ({ products, eventDays, isLogin }) => {
    const [updateProduct, { loading: productLoading, data: productData }] = useMutation("/api/owner/products");
    const [deleteProduct, { loading: deleteLoading, data: deleteData }] = useMutation("/api/owner/products/delete")
    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<productForm>();
    const [selectedId, setSelectedId] = useState<number>();
    const [selectedName, setSelectedName] = useState<string>();
    const [selectedPrice, setSelectedPrice] = useState<number>();
    const [selectedStockQuantity, setSelectedStockQuantity] = useState<number>();
    const [selectedEventDay, setSelectedEventDay] = useState<string[]>([]);
    const [selectedDescription, setDescription] = useState<string>();
    const [selectedSize, setSize] = useState<string>();
    const [selectedImage, setSelectedImage] = useState<string>();
    const [showImage, setShowImage] = useState(false);
    const [deleteSelected, setDeleteSelected] = useState(false);
    const [eventVisibility, setEventVisibility] = useState(false);
    const [showDeleteVisibility, setShowDeleteVisibility] = useState(false);
    const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!isLogin) {
            router.push("/shop")
        }
    }, [isLogin])

    useEffect(() => {
        if (productData?.ok) {
            setShowLoadingAnimation(false);
            setShowImage(true);

            const timer = setTimeout(() => {
                setShowImage(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [productData])

    const { productId = "" } = router.query;

    const rowRef = useRef<any>(null);

    const scrollToDiv = () => {
        if (rowRef.current)
            rowRef.current.scrollIntoView({ behavior: 'smooth' })
    };

    useEffect(() => {
        if (productId && products) {
            setSelectedId(+productId);
            const product = products.find((p) => p.id === +productId);
            setSelectedName(product?.name);
            setSelectedPrice(product?.price);
            setSelectedStockQuantity(product?.stockQuantity);
            setSelectedEventDay(product?.productEventDay.map(p => p.eventDaysId.toString()) ?? [])
            setDeleteSelected(false);
            setDescription(product?.description);
            setSize(product?.size);
            setSelectedImage(product?.image)
            scrollToDiv();
        }
    }, [productId])

    const selectedProduct = (id: number, name: string, price: number, stockQuantity: number, eventDay: string[], description: string, size: string, image: string) => {
        if (id) {
            setSelectedId(id);
            setSelectedName(name);
            setSelectedPrice(price);
            setSelectedStockQuantity(stockQuantity);
            setSelectedEventDay(eventDay)
            setDeleteSelected(false);
            setDescription(description);
            setSize(size ?? "");
            setSelectedImage(image);
        }
    }

    const onValid = ({ id, name, price, stockQuantity, eventDay, description, size }: productForm) => {

        if (!products)
            return

        const index = products.findIndex(item => item.id === id);

        const updatedData = [...products];

        // Update the field
        updatedData[index].name = name;
        updatedData[index].price = price;
        updatedData[index].stockQuantity = stockQuantity;
        updatedData[index].productEventDay = eventDay.map((eventDaysId) => ({ eventDaysId }));
        updatedData[index].description = description;
        updatedData[index].size = size;

        updateProduct({
            id,
            name,
            price,
            stockQuantity,
            eventDay,
            description,
            size
        });
        setShowLoadingAnimation(true);
    }

    useEffect(() => {

        if (selectedId) {
            setValue("id", selectedId);
            setValue("name", selectedName ?? "");
            setValue("price", selectedPrice ?? 0);
            setValue("stockQuantity", selectedStockQuantity ?? 0);
            setValue("eventDay", selectedEventDay ?? "");
            setValue("description", selectedDescription ?? "");
            setValue("size", selectedSize ?? "");
        }
    }, [selectedId, selectedName, selectedPrice, selectedStockQuantity, selectedEventDay, setValue, selectedDescription, selectedSize])

    const onDeleteClicked = () => {
        if (selectedId)
            deleteProduct({ productId: selectedId });
    }

    return (
        <Layout title="Home" hasTabBar>
            {
                <>
                    <Checkmark showIcon={showImage} />
                    <LoadingAnimation showLoadingAnimation={showLoadingAnimation} />
                </>
            }
            <div className="px-4 md:px-20 py-4 bg-gray-100 w-full">
                <div className="flex">
                    <table className="divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    Image
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    localImage
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    StockQuantity
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                    ProductEventDay
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" >
                            {products?.map((product, index) =>
                                <tr key={product.id}
                                    ref={product.id === +productId ? rowRef : null}

                                    className={`${selectedId && selectedId === product.id ? "bg-gray-500" : product.stockQuantity === 0 ? "bg-red-200" : "bg-white"}`}
                                    onClick={() => selectedProduct(product.id, product.name, product.price, product.stockQuantity, product.productEventDay.map(p => p.eventDaysId.toString()), product.description, product.size, product.image)}>
                                    <Link legacyBehavior href={`/products/${product.id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-700 underline cursor-pointer">{product.id}</td>
                                    </Link>
                                    <td >
                                        <Image
                                            src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${product.image}/productId`}
                                            width={100}
                                            height={100}
                                            alt=""
                                            loading="lazy" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap ">{product.localImage}</td>
                                    <td className="px-6 py-4 whitespace-nowrap ">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap ">{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap ">{product.stockQuantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap ">{product.productEventDay?.map((p) => <div key={p.eventDaysId}>{eventDays.find((d) => d.id === Number(p.eventDaysId))?.name}</div>)}</td>
                                </tr>)}
                        </tbody>
                    </table>
                    <div className="flex flex-col min-w-[47rem] fixed top-0 -right-80 p-2 bg-gray-300">
                        <button className="text-left rounded-2xl p-2 bg-yellow-400" onClick={() => setEventVisibility(p => !p)}>Show/Hide Event</button>
                        <button className="text-left rounded-2xl p-2 bg-red-400" onClick={() => setShowDeleteVisibility(p => !p)}>Show/Hide Delete</button>
                        {/* <button className="text-left rounded-2xl p-2 bg-green-400" onClick={() => scrollToDiv()}>Locate Me</button> */}
                        <div className="flex">
                            <Image
                                src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${selectedImage}/productId`}
                                width={100}
                                height={100}
                                alt=""
                                loading="lazy" />
                        </div>
                        <form className="p-4 space-y-4 w-1/2" onSubmit={handleSubmit(onValid)}>
                            <Input register={register("id", { required: true })} required label="id*" name="id" kind="text" type={""} disabled={true} />
                            <Input register={register("name", { required: true })} required label="Name*" name="name" kind="text" type={""} />
                            <Input register={register("price", { required: true })} required label="price*" name="price" kind="number" type={""} />
                            <Input register={register("stockQuantity", { required: true })} required label="stock*" name="stockQuantity" kind="number" type={""} />
                            <div className={`${eventVisibility ? 'block' : 'hidden'}`}>
                                <Input
                                    register={register("eventDay", { required: true })}
                                    label="eventDay"
                                    name="eventDay"
                                    type="text"
                                    kind="event"
                                    eventDays={eventDays}
                                />
                            </div>
                            <Input register={register("description", { required: true })} required label="Description*" name="description" kind="text" type={""} />
                            <Input register={register("size")} label="Size*" name="size" kind="text" type={""} />

                            <button className="p-2 rounded-lg text-white bg-green-500">Update</button>
                        </form>
                        <div className={`${showDeleteVisibility ? 'block' : 'hidden'}`}>
                            <button className={`ml-4 p-2 rounded-lg text-white bg-red-500 w-28`} onClick={() => setDeleteSelected(true)}>Delete</button>
                            <button className={`ml-4 mt-2 p-2 rounded-lg text-white bg-red-700 w-56 ${deleteSelected ? "block" : "hidden"}`} onClick={() => onDeleteClicked()} >Delete Confirmation</button>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { id: any; }; req: NextApiRequest }) {
    let isLogin = false

    try {
        try {
            const profile = await client.admin.findUnique({
                where: {
                    id: context.req.session.admin?.id
                },
            });

            //Do not remove this.
            //Somehow context.req.session.user === undefined does not get captured in the if statement
            //so I am forcing it to be catched in the catch block by adding 1 to undefined.
            if (context.req.session.admin) {
                const test = context.req.session.admin?.id + 1;
            }

            if (context.req.session.admin === undefined || context.req.session.admin.id === undefined) {
                isLogin = false;
                context.req.session.destroy();
            }
            if (profile) {
                isLogin = true;
            }
            else {
                return {
                    props: {
                        isLogin: false
                    }
                }
            }
        }
        catch (err) {
            isLogin = false;
            context.req.session.destroy();
            return {
                props: {
                    isLogin: false
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        return {
            props: {
                isLogin: false
            }
        }
    }

    const products = await client.product.findMany({
        select: {
            id: true,
            name: true,
            price: true,
            stockQuantity: true,
            image: true,
            localImage: true,
            productEventDay: {
                select: {
                    eventDaysId: true,
                },
            },
            size: true,
            description: true
        },
    });

    const eventDays = await client.eventDays.findMany({
    })

    return {
        props: {
            products: JSON.parse(JSON.stringify(products)),
            eventDays: JSON.parse(JSON.stringify(eventDays)),
            isLogin: JSON.parse(JSON.stringify(isLogin))
        },
    };
});

export default Products;