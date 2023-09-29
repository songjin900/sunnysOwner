import Item from "@components/items";
import Layout from "@components/layout";
import { Product, SubMenuCategory, MenuCategory, ProductSubMenuCategory, ProductEventDay, EventDays } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { NextPage } from "next";
import client from "@libs/server/client";
import MobileMenu from "@components/mobileShopMenu";

interface SubMenuWithMenu extends MenuCategory {
    subMenuCategory: SubMenuCategory[]
}

async function fetchProducts(param: string) {
    const productResponse = await fetch(`/api/products${param}`);
    return productResponse.json();
}

const HomePage: NextPage<{ menu: SubMenuWithMenu[]; event: EventDays[] }> = ({ menu, event }) => {

    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [menuCategory, setMenuCategoryData] = useState<SubMenuWithMenu[]>(menu);
    const [eventDay, setEventDayData] = useState<EventDays[]>(event);
    const [queryParam, setQueryParam] = useState("");
    const [initialFetch, setInitialFetch] = useState(true);

    const { menuCategoryId = "", subMenuCategoryId = "", search = "", eventDaysId = "", sort = "", page = 1 } = router.query;

    const [category, setCategory] = useState(-1);
    const [subCategory, setSubCategory] = useState(-1);
    const [sorting, setSorting] = useState("");
    const [openRefine, setOpenRefine] = useState(false);
    const [openSort, setOpenSort] = useState(false);

    const [searchWord, setSearchWord] = useState("");
    const [selectedEventMenu, setSelectedEventMenu] = useState(-1);

    const [pageNum, setPageNum] = useState(1);
    const [pageArray, setPageArray] = useState([0])

    const divRefMenu = useRef<HTMLDivElement>(null);

    const scrollToDiv = () => {
        // if (divRefMenu.current)
        //     divRefMenu.current.scrollIntoView({ behavior: 'auto' })
    };

    useEffect(() => {
        if (menuCategoryId)
            setCategory(+menuCategoryId);
    }, [menuCategoryId])

    useEffect(() => {
        if (subMenuCategoryId)
            setSubCategory(+subMenuCategoryId)
    }, [subMenuCategoryId])

    useEffect(()=>{
        if (pageNum){
            setPageNum(+page);
        }
    },[page])

    useEffect(() => {
        if (eventDaysId)
            setSelectedEventMenu(+eventDaysId)
    }, [eventDaysId])

    const onCategoryChange = (category: number) => {
        setCategory(category);
    }

    const onSubCategoryChange = (subCategory: number) => {
        setSubCategory(subCategory);
    }

    const onSortingChange = (sorting: string) => {
        setSorting(sorting);
    }

    useEffect(() => {
        setPageNum(1);
    }, [selectedEventMenu, category])

    useEffect(() => {
        if (!search && !menuCategoryId && !subMenuCategoryId && !eventDaysId) {
            const fetchData = async () => {
                const dataResponse = await fetchProducts(``)
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
            setInitialFetch(false);
        }
    }, []) // do not put anything here. this is just initial run

    useEffect(() => {
        if (search && initialFetch)
            return;

        if (initialFetch)
            return;

        //i need to put a condition so that it does not run when it first render
        const fetchData = async () => {
            let url = `${queryParam}&sort=${sorting ? sorting : "la"}&page=${pageNum}`;
            if (queryParam === '') {
                url = `?sort=${sorting ? sorting : "la"}&page=${pageNum}`;
            }
            router.push(url);
            const dataResponse = await fetchProducts(`${url}`)
            setProducts(dataResponse.products);
        };
        fetchData();
    }, [pageNum, sorting]) //do not put queryParam and initialFetch. this makes re-render twice

    useEffect(() => {
        if (search !== searchWord) {
            setSearchWord(search + "");
            setCategory(-1);
            setSubCategory(-1);
            setSelectedEventMenu(-1);

            setInitialFetch(false);

            setQueryParam(`?search=${search}`);
            const fetchData = async () => {
                router.push(`?search=${search}`);
                const dataResponse = await fetchProducts(`?search=${search}`)
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        }
    }, [search]) // do not add searchWord

    useEffect(() => {

        if (selectedEventMenu !== -1) {
            setInitialFetch(false);
            setSearchWord("");
            setCategory(-1);
            setSubCategory(-1);

            if (search) {
                router.push(`/shop`);
            }

            setQueryParam(`?eventDaysId=${selectedEventMenu}`);

            const fetchData = async () => {
                router.push(`?eventDaysId=${selectedEventMenu}`);
                const dataResponse = await fetchProducts(`?eventDaysId=${selectedEventMenu}`)
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        }
        else if (subCategory !== -1) {

            setInitialFetch(false);
            if (search) {
                router.push(`/shop`);
            }

            setQueryParam(`?subMenuCategoryId=${subCategory}`);

            const fetchData = async () => {
                router.push(`?subMenuCategoryId=${subCategory}`);
                const dataResponse = await fetchProducts(`?subMenuCategoryId=${subCategory}`)
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        }
        else if (category !== -1) {

            setInitialFetch(false);
            if (search) {
                router.push(`/shop`);
            }

            setSearchWord("");
            setSelectedEventMenu(-1);

            //shop all
            if (category === 6) {
                setQueryParam(``);
                const fetchData = async () => {
                    router.push(``);
                    const dataResponse = await fetchProducts(``)
                    setProducts(dataResponse.products);
                    setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
                };
                fetchData();
            }
            else {
                setQueryParam(`?menuCategoryId=${category}`);
                const fetchData = async () => {
                    router.push(`?menuCategoryId=${category}`);
                    const dataResponse = await fetchProducts(`?menuCategoryId=${category}`)
                    setProducts(dataResponse.products);
                    setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
                };
                fetchData();
            }
        }

    }, [category, subCategory, selectedEventMenu]) //do not put Router here

    return (
        <Layout title="Home" hasTabBar>
            <div className="w-full" ref={divRefMenu}>
                {/* <LoadingAnimation showLoadingAnimation={showLoadingAnimation} /> */}
                <div className={`w-full`}>
                    {/* mobile view */}
                    <div>
                        <div className={`grid grid-cols-2 items-center p-2 border border-gray-300 lg:hidden`}>
                            <span onClick={() => { setOpenRefine(true); setOpenSort(false) }} className="items-center flex justify-center cursor-pointer border-r-2">Menu</span>
                            <span onClick={() => { setOpenSort(true); setOpenRefine(false) }} className="items-center flex justify-center cursor-pointer">Sort</span>
                        </div>
                        <div className={`lg:hidden top-0 left-0 fixed bg-white w-full h-full pt-12 pl-8 ease-in-out duration-300 flex-grow ${openRefine ? `-translate-x-0` : `-translate-x-full`}`}>
                            <div className="flex justify-start">
                                <button onClick={() => setOpenRefine(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* mobileView */}
                            <div className="w-full h-full overflow-y-auto">
                                <MobileMenu menuCategory={menuCategory} eventDay={eventDay} setSelectedEventMenu={setSelectedEventMenu} setOpenRefine={setOpenRefine} onCategoryChange={onCategoryChange} onSubCategoryChange={onSubCategoryChange} ></MobileMenu>
                            </div>
                        </div>
                    </div>

                    <div className={`lg:hidden top-0 left-0 fixed bg-white w-full h-full pt-12 pl-8 ease-in-out duration-300 flex-grow ${openSort ? `-translate-x-0` : `-translate-x-full`}`}>
                        <div className="flex justify-start">
                            <button onClick={() => setOpenSort(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-900 text-2xl font-medium mt-4">Sort</span>
                            <span onClick={() => { onSortingChange("la"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "la" ? "underline" : ""}`}>Latest</span>
                            <span onClick={() => { onSortingChange("pa"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "pa" ? "underline" : ""}`}>Price: Low to high</span>
                            <span onClick={() => { onSortingChange("pd"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "pd" ? "underline" : ""}`}>Price: High to low</span>
                            <span onClick={() => { onSortingChange("na"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "na" ? "underline" : ""}`}>Name: Ascending</span>
                            <span onClick={() => { onSortingChange("nd"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "nd" ? "underline" : ""}`}>Name: Descending</span>
                        </div>
                    </div>

                    {/* webVersion Menu */}
                    <div className="flex">
                        <div className="hidden lg:block w-[18rem] pl-6">
                            <div className="flex flex-col mt-6">
                                <span className={"text-gray-600 text-xl font-bold mb-4"}>All Categories</span>
                                <>
                                    {
                                        menuCategory
                                            .slice(0)
                                            .sort((a, b) => ((a.categoryIndex ?? 0) > (b.categoryIndex ?? 0) ? 1 : -1))
                                            .map((menu) => (
                                                <div key={menu.id}>
                                                    <div className="flex items-center space-x-2">
                                                        <span onClick={() => { onCategoryChange(menu.id); setSearchWord(""); setSubCategory(-1); setSelectedEventMenu(-1) }}
                                                            className={`text-gray-600 mt-1 cursor-pointer text-lg 
                                                                ${category === menu.id && menu.category === "all" || (category === menu.id) ? "underline text-green-700 font-bold" : ""}`}>{menu.categoryDisplay}
                                                        </span>
                                                        {menu.category !== "all" ?
                                                            category === menu.id ?
                                                                <div className="flex pt-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                                    </svg>
                                                                </div> :
                                                                <div className="flex pt-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                                    </svg>
                                                                </div>
                                                            : null
                                                        }
                                                    </div>
                                                    <>
                                                        {
                                                            menu && menu.subMenuCategory && menu.category != "all" ? (
                                                                <div>
                                                                    {
                                                                        menu.subMenuCategory.map((submenu) => submenu.platform === "both" ? (
                                                                            <div key={submenu.subCategoryDisplay} >
                                                                                <span onClick={() => { onSubCategoryChange(submenu.id ?? -1) }}
                                                                                    className={`text-gray-600 mt-1 cursor-pointer text-lg ml-2 ${category === menu.id ? "" : "hidden"} ${subCategory === submenu.id ?
                                                                                        "underline text-green-700 font-bold" : ""}`}>{submenu.subCategoryDisplay}</span>
                                                                            </div>
                                                                        ) : null
                                                                        )
                                                                    }
                                                                </div>
                                                            ) : null
                                                        }
                                                    </>
                                                </div>
                                            ))
                                    }
                                </>
                                <span className={"text-gray-600 text-xl font-bold mt-6 mb-4"}>Shop by Events</span>
                                {
                                    eventDay.filter(x => x.visibility === true).map((day) => (
                                        <div key={day.id} className="">
                                            <span
                                                onClick={() => { setSelectedEventMenu(day.id) }}
                                                className={`text-gray-600 flex mb-1 cursor-pointer text-lg ${selectedEventMenu === day.id ? `underline text-green-700 font-bold` : ""}`} >{day.name}</span>
                                        </div>
                                    ))
                                }

                                <span className="text-gray-600 text-xl font-bold mt-6 mb-4">Sort</span>
                                <span onClick={() => { onSortingChange("la") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "la" ? "underline" : ""}`}>Latest</span>
                                <span onClick={() => { onSortingChange("pa") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "pa" ? "underline" : ""}`}>Price: Low to high</span>
                                <span onClick={() => { onSortingChange("pd") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "pd" ? "underline" : ""}`}>Price: High to low</span>
                                <span onClick={() => { onSortingChange("na") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "na" ? "underline" : ""}`}>Name: Ascending</span>
                                <span onClick={() => { onSortingChange("nd") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "nd" ? "underline" : ""}`}>Name: Descending</span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="grid grid-cols-2 grid-rows-2
                              sm:grid-cols-3    
                              lg:grid-cols-4  
                              gap-5 bg-white py-5 px-5 w-full">
                                {products?.map((product) => (
                                    <Item
                                        id={product.id}
                                        key={product.id}
                                        title={product.name}
                                        price={product.price}
                                        image={product.image}
                                    />
                                ))}
                            </div>
                            <div className="flex  justify-center">
                                {
                                    pageArray.length > 1 ?
                                        pageArray
                                            .map((p) =>
                                                <div onClick={() => {setPageNum(p); scrollToDiv()}} className={`cursor-pointer p-2 m-1 text-sm font-normal text-gray-900 rounded-md ${pageNum === p ? "border bg-gray-300" : "bg-gray-100"}`} key={p}>
                                                    {p}
                                                </div>)
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export const getServerSideProps = async () => {

    const event = await client.eventDays.findMany({
        where: {
            visibility: true
        }
    })

    const menu = await client.menuCategory.findMany({
        where: {
            visibility: true
        },
        select: {
            id: true,
            categoryDisplay: true,
            category: true,
            categoryIndex: true,
            description: true,
            subDescription: true,
            subMenuCategory: {
                select: {
                    id: true,
                    subCategoryDisplay: true,
                    subCategory: true,
                    subcategoryIndex: true,
                    visibility: true,
                    platform: true,
                    image: true,
                    menuCategoryId: true
                }
            }
        }
    })

    return {
        props: {
            menu: JSON.parse(JSON.stringify(menu)),
            event: JSON.parse(JSON.stringify(event))
        },
    };
};

export default HomePage;