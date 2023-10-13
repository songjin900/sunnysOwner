import { NextApiRequest, NextPage } from "next";
import Layout from "@components/layout";
import { Cart, MenuCategory, Product, ProductImage, SubMenuCategory } from "@prisma/client";
import { useRouter } from "next/router";
import useMutation from "@libs/client/useMutation";
import { useEffect, useState } from "react";
import ImageSlides from "@components/imageSlider";
import LoadingButton from "@components/loadingButton";
import CategoryPath from "@components/categoryPath";
import RelatedProducts from "@components/relatedProducts";
import LoadingAnimation from "@components/loadingAnimation";
import client from "@libs/server/client";
import useSWR from "swr";
import GuestCheckout from "@components/guestCheckout";
import Image from "next/image";
import { withSsrSession } from "@libs/server/withSession";
import Link from "next/link";
import menucategory from "pages/api/utils/menucategory";

interface MenuWithSubMenu extends SubMenuWithProductSubCat {
    menu: MenuCategory
}

interface SubMenuWithProductSubCat extends SubMenuCategory {
    subMenuCategory: MenuWithSubMenu
}

interface ProductWithSubCategoryImage extends Product {
    productImage: ProductImage[]
    productSubMenuCategory: SubMenuWithProductSubCat
}

interface ItemInCartResponse {
    ok: boolean,
    cart: Cart,
    message: string
}

interface productImage {
    id: number,
    image: string
}

interface GroupedProducts {
    product: productImage[]
}

const ItemDetail: NextPage<{ product: ProductWithSubCategoryImage; relatedProducts: Product[], isLogin: boolean, groupedProducts: GroupedProducts }> = ({ product, relatedProducts, isLogin, groupedProducts }) => {

    const router = useRouter()
    const { data: userData, error: userError } = useSWR("/api/users/me");

    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(false);

    const updateRegisteredUser = (result: boolean) => {
        setRegisteredUser(result)
    }

    useEffect(() => {
        setButtonDisabled(product.stockQuantity === 0 ? true : false)
    }, [product.stockQuantity])

    const [addToCart, { loading: cartLoading, data: cart }] = useMutation<ItemInCartResponse>(`/api/products/${router.query.id}/cart`);

    const [cartQuantity, setCartQuantity] = useState(1);

    const onQtyDecreaseClicked = () => {
        if (product?.stockQuantity && cartQuantity - 1 > 0) {
            setCartQuantity(cartQuantity - 1);
        }
    }

    const onQtyIncreaseClicked = () => {
        if (product?.stockQuantity && cartQuantity + 1 <= product?.stockQuantity)
            setCartQuantity(cartQuantity + 1);
    }

    const onAddToCartClick = () => {
        setShowLoading(true);
        if (cartLoading)
            return;
        addToCart({ cartQuantity, id: router.query.id });
        setShowLoading(true);
    }

    //postData
    useEffect(() => {
        if (cartLoading)
            return;

        if (cart?.ok) {
            router.push(`/cart`);
        }
    }, [cart, cartLoading, router]) //don't put userData

    useEffect(() => {
        if (isLogin || userData?.ok) {
            setRegisteredUser(true)
        }
        else {
            setRegisteredUser(false);
        }
    }, [isLogin, userData])

    const onEditClicked = () =>{
        router.push(`/owner/products?productId=${router.query.id}`)
    }

    return (
        <Layout title="View Product" hasTabBar >
            <LoadingAnimation showLoadingAnimation={showLoadingAnimation} />
            <div className={`w-full p-4 bg-white ${showLoadingAnimation ? "opacity-30" : "opacity-100"}`}>
                <div className="flex flex-col">
                    <CategoryPath categories={product.productSubMenuCategory?.subMenuCategory} />
                    <div className="flex flex-col w-full items-center lg:items-start lg:flex-row lg:justify-center lg:space-x-14 lg:h-full pt-4">
                        <div className="p-2 h-full">
                            <ImageSlides imageSlides={product.productImage}></ImageSlides>
                        </div>
                        <div className="flex flex-col w-full lg:w-full max-w-[30rem] lg:h-[60%] lg:justify-between mt-6 lg:mt-2">
                            <div className="flex flex-col pl-3 space-y-2 lg:w-full lg:p-1">
                                <span className="font-bold text-3xl">{product.name}</span>
                                <span className="text-lg">Model: {product.modelNumber}</span>
                                <span className="text-2xl">${product.price}</span>

                                <span className={`text-lg ${product.stockQuantity > 10 ? `hidden` : `block`}`}>Availability: {product.stockQuantity}</span>
                                <span className="text-md">Images may look different from actual product</span>
                            </div>
                            {
                                groupedProducts && groupedProducts.product.length > 0 ? <div className="flex flex-col my-10">
                                    <span className="text-sm mb-2">Different Colors</span>
                                    <div className="flex gap-x-2">{
                                        groupedProducts.product.map((p) =>
                                            <Link key={p.id} legacyBehavior href={`/products/${p.id}`}>

                                                <Image
                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${p.image}/imageSlide`}
                                                    width={70}
                                                    height={70}
                                                    alt=""
                                                    className={`${product.id === p.id ? 'border-green-500' : 'border-gray-300'} border-2 rounded-xl cursor-pointer`}
                                                    loading="lazy"
                                                />
                                            </Link>
                                        )
                                    }
                                    </div>
                                </div>
                                    : null
                            }

                            <div className="mt-3 p-1 bg-[#F4F4F4] rounded-2xl">
                                {
                                    registeredUser ?
                                        <>
                                            <div className="flex items-center gap-x-2 m-3">
                                                <span className="text-lg">Qty: </span>
                                                <button onClick={onQtyDecreaseClicked}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <span className="text-lg">{cartQuantity}</span>
                                                <button onClick={onQtyIncreaseClicked}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                        : null
                                }
                                <div className="flex items-center justify-between m-2">
                                    {
                                        !registeredUser ?
                                            <GuestCheckout updateRegisteredUser={updateRegisteredUser} ></GuestCheckout>
                                            :
                                            cartLoading || showLoading ?
                                                <LoadingButton /> :
                                                <button
                                                    onClick={onAddToCartClick}
                                                    disabled={buttonDisabled}
                                                    className={`w-full ${buttonDisabled ? `bg-gray-500` : `bg-green-500 hover:bg-green-600`} 
                                                 text-white  px-4 border border-transparent 
                                            rounded-2xl shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                                            focus:outline-none py-2 text-sm `}>{!buttonDisabled ? "Add To Cart" : "Out of Stock"}
                                                </button>
                                    }
                                </div>

                            </div>
                            <button className="p-2 bg-red-300 rounded-3xl" onClick={()=>onEditClicked()}>
                                수정하기
                            </button>
                        </div>
                    </div>
                    <RelatedProducts relatedProducts={relatedProducts} />
                </div>
            </div>
        </Layout>
    )
}

export const getServerSideProps = withSsrSession(async function (context: { query: { id: any; }; req: NextApiRequest }) {

    try {
        let isLogin = true

        try {

            const profile = await client.user.findUnique({
                where: {
                    id: context.req.session.user?.id
                },
            });

            //Do not remove this.
            //Somehow context.req.session.user === undefined does not get captured in the if statement
            //so I am forcing it to be catched in the catch block by adding 1 to undefined.
            if (context.req.session.user) {
                const test = context.req.session.user?.id + 1;
            }

            if (context.req.session.user === undefined || context.req.session.user.id === undefined) {
                isLogin = false;
                context.req.session.destroy();
            }

            if (!profile || (profile && profile.status !== "active")) {
                isLogin = false;
                context.req.session.destroy();
            }
        }
        catch (err) {
            isLogin = false;
            context.req.session.destroy();
        }

        //Product Id
        const { id } = context.query;

        const product = await client.product.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                productImage: {
                    select: {
                        image: true,
                        orderIndex: true,
                    },
                },
                productSubMenuCategory: {
                    include: {
                        subMenuCategory: {
                            include: {
                                menu: true,
                            },
                        },
                    },
                },
            },
        });

        const terms = product?.name.split(" ").map((word) => ({
            name: {
                contains: word,
            }
        }));

        const relatedProducts = await client.product.findMany({
            where: {
                productSubMenuCategory: {
                    subMenuCategoryId: product?.productSubMenuCategory?.subMenuCategoryId
                },
                OR: terms,
                AND: [
                    {
                        id: {
                            not: Number(product?.id),
                        },
                    },
                    {
                        OR: [
                            {
                                groupId: {
                                    not: Number(product?.groupId ?? -1),
                                },
                            },
                            {
                                groupId: null,
                            },
                        ],
                    },
                ],
            },
        });

        const groupedProducts = await client.group.findFirst({
            where: {
                id: product?.groupId ?? -1,
            },
            select: {
                product: {
                    select: {
                        id: true,
                        image: true
                    }
                }
            },
            // take: 5            
        });

        return {
            props: {
                product: JSON.parse(JSON.stringify(product)),
                relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
                isLogin,
                groupedProducts: JSON.parse(JSON.stringify(groupedProducts)),
            }
        }
    }
    catch (err) {
        console.log(err);
    }
})

export default ItemDetail;