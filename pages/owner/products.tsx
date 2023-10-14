import Layout from "@components/layout";
import { NextPage } from "next";
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
}

interface productForm {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    eventDay: string[];
    description: string;
}

const Products: NextPage<{ products: products[]; eventDays: EventDays[] }> = ({ products, eventDays }) => {
    const [updateProduct] = useMutation("/api/owner/products");
    const [deleteProduct, { loading: deleteLoading, data: deleteData }] = useMutation("/api/owner/products/delete")
    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<productForm>();
    const [selectedId, setSelectedId] = useState<number>();
    const [selectedName, setSelectedName] = useState<string>();
    const [selectedPrice, setSelectedPrice] = useState<number>();
    const [selectedStockQuantity, setSelectedStockQuantity] = useState<number>();
    const [selectedEventDay, setSelectedEventDay] = useState<string[]>([]);
    const [selectedDescription, setDescription] = useState<string>();
    const [showImage, setShowImage] = useState(false);
    const [deleteSelected, setDeleteSelected] = useState(false);
    const router = useRouter();

    const { productId = "" } = router.query;

    const fifthRowRef = useRef<any>(null);

    const scrollToDiv = () => {
        if (fifthRowRef.current)
        fifthRowRef.current.scrollIntoView({ behavior: 'smooth' })
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
            scrollToDiv();

        }
    }, [productId])

    const selectedProduct = (id: number, name: string, price: number, stockQuantity: number, eventDay: string[], description: string) => {
        if (id && name && price && stockQuantity) {
            setSelectedId(id);
            setSelectedName(name);
            setSelectedPrice(price);
            setSelectedStockQuantity(stockQuantity);
            setSelectedEventDay(eventDay)
            setDeleteSelected(false);
            setDescription(description);
        }
    }

    const onValid = ({ id, name, price, stockQuantity, eventDay, description }: productForm) => {

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

        updateProduct({
            id,
            name,
            price,
            stockQuantity,
            eventDay,
            description
        });

        setShowImage(true);

        const timer = setTimeout(() => {
            setShowImage(false);
        }, 1000);
        return () => clearTimeout(timer);
    }

    useEffect(() => {
        if (selectedId && selectedName && selectedPrice && selectedStockQuantity && selectedDescription) {
            setValue("id", selectedId);
            setValue("name", selectedName);
            setValue("price", selectedPrice);
            setValue("stockQuantity", selectedStockQuantity);
            setValue("eventDay", selectedEventDay);
            setValue("description", selectedDescription);
        }
    }, [selectedId, selectedName, selectedPrice, selectedStockQuantity, selectedEventDay, setValue, selectedDescription])

    const onDeleteClicked = () => {
        if (selectedId)
            deleteProduct({ productId: selectedId });
    }
  
    return (
        <Layout title="Home" hasTabBar>
            {
                <Checkmark showIcon={showImage} />
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
                                    // ref={productRefs[index]} 
                                    ref={product.id === +productId ? fifthRowRef : null} // Set ref for 5th row

                                    className={`${selectedId && selectedId === product.id ? "bg-gray-300" : "bg-white"}`}
                                    onClick={() => selectedProduct(product.id, product.name, product.price, product.stockQuantity, product.productEventDay.map(p => p.eventDaysId.toString()), product.description)}>
                                        <Link legacyBehavior href={`/products/${product.id}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-blue-700 underline cursor-pointer">{product.id}</td>
                                        </Link>
                                    <td >
                                        <Image
                                            src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${product.image}/imageSlide`}
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
                        <form className="p-4 space-y-4 w-1/2" onSubmit={handleSubmit(onValid)}>
                            <Input register={register("id", { required: true })} required label="id*" name="id" kind="text" type={""} disabled={true} />
                            <Input register={register("name", { required: true })} required label="Name*" name="name" kind="text" type={""} />
                            <Input register={register("price", { required: true })} required label="price*" name="price" kind="number" type={""} />
                            <Input register={register("stockQuantity", { required: true })} required label="stock*" name="stockQuantity" kind="number" type={""} />
                            <Input
                                register={register("eventDay", { required: true })}
                                label="eventDay"
                                name="eventDay"
                                type="text"
                                kind="event"
                                eventDays={eventDays}
                            />
                            <Input register={register("description", { required: true })} required label="Description*" name="description" kind="text" type={""} />
                            <button className="p-2 rounded-lg text-white bg-green-500">Update</button>
                        </form>
                        <button className={`ml-4 p-2 rounded-lg text-white bg-red-500 w-28`} onClick={() => setDeleteSelected(true)}>Delete</button>
                        <button className={`ml-4 mt-2 p-2 rounded-lg text-white bg-red-700 w-56 ${deleteSelected ? "block" : "hidden"}`} onClick={() => onDeleteClicked()} >Delete Confirmation</button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export const getServerSideProps = async () => {
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
            description: true
        },
    });

    const eventDays = await client.eventDays.findMany({
    })

    return {
        props: {
            products: JSON.parse(JSON.stringify(products)),
            eventDays: JSON.parse(JSON.stringify(eventDays))
        },
    };
};

export default Products;