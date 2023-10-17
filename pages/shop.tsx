import Item from "@components/items";
import Layout from "@components/layout";
import { Product, SubMenuCategory, MenuCategory, EventDays } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { NextPage } from "next";
import client from "@libs/server/client";
import MobileMenu from "@components/mobileShopMenu";

interface SubMenuWithMenu extends MenuCategory {
    subMenuCategory: SubMenuCategory[]
}

async function fetchProducts(param: string, fetchNum: number) {
    const productResponse = await fetch(`/api/products${param}`);

    return productResponse.json();
}

const HomePage: NextPage<{ menu: SubMenuWithMenu[]; event: EventDays[] }> = ({ menu, event }) => {

    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [menuCategory, setMenuCategoryData] = useState<SubMenuWithMenu[]>(menu);
    const [eventDay, setEventDayData] = useState<EventDays[]>(event);

    const { menuCategoryId = "", subMenuCategoryId = "", search = "", eventDaysId = "", sort = "", page = "" } = router.query;

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

    //this seems like it is coming from the URL. Test 
    useEffect(() => {
        if (menuCategoryId) {
            setCategory(+menuCategoryId);
        }
    }, [menuCategoryId])

    useEffect(() => {
        if (subMenuCategoryId) {
            setSubCategory(+subMenuCategoryId)
        }
    }, [subMenuCategoryId])

    useEffect(() => {
        if (page) {
            setPageNum(+page);
        }
    }, [page])

    useEffect(() => {
        if (search) {
            setSearchWord(search + "");
        }
    }, [search])

    useEffect(() => {
        if (eventDaysId)
            setSelectedEventMenu(+eventDaysId)
    }, [eventDaysId])

    //This is for getting values from the URL
    //example: back button or url copy and paste
    useEffect(() => {

        let urlContainsValue = false;
        if (search) {
            setSearchWord(search + "");
            urlContainsValue = true;
        }

        if (menuCategoryId) {
            setCategory(+menuCategoryId);
            urlContainsValue = true;
        }

        if (subMenuCategoryId) {
            const menuId = menu.find(x => x.subMenuCategory.find(y => y.id === +subMenuCategoryId))?.id
            setCategory(menuId ?? -1);
            setSubCategory(+subMenuCategoryId)
            urlContainsValue = true;
        }

        if (eventDaysId) {
            setSelectedEventMenu(+eventDaysId)
            urlContainsValue = true;
        }

        if (sort) {
            setSorting(sort + "");
            urlContainsValue = true;
        }

        if (page) {
            setPageNum(+page)
            urlContainsValue = true;
        }

        //if url is /shop or /shop?sort=la&page=2
        if (!urlContainsValue || !search && !subMenuCategoryId && !eventDaysId && !menuCategoryId) {
            setCategory(6);
            let pageNumber = +page;
            if (page === "" || +page === 0) {
                pageNumber = 1;
            }
            setPageNum(pageNumber)
        }
    }, []) // do not put anything here. this is just initial run

    //all Routing
    useEffect(() => {
        if (searchWord) {
            let pageNumber = pageNum;
            if (category !== -1 || subCategory !== -1 || selectedEventMenu !== -1){
                pageNumber = 1;
                setPageNum(1);
            }
            setCategory(-1);
            setSubCategory(-1);
            setSelectedEventMenu(-1);

            let url = `?search=${searchWord}` + `${sorting ? `&sort=${sorting}` : `&sort=la`}` + `&page=${pageNumber}`
          
            const fetchData = async () => {
                router.push(url);
                const dataResponse = await fetchProducts(url, 2);
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        } else if (selectedEventMenu !== -1) {
            setSearchWord("");
            setCategory(-1);
            setSubCategory(-1);

            let url = `?eventDaysId=${selectedEventMenu}` + `${sorting ? `&sort=${sorting}` : `&sort=la`}` + `${pageNum ? `&page=${pageNum}` : `&page=1`}`

            const fetchData = async () => {
                router.push(url);
                const dataResponse = await fetchProducts(url, 3);
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        }
        else if (subCategory !== -1) {

            let url = `?subMenuCategoryId=${subCategory}` + `${sorting ? `&sort=${sorting}` : `&sort=la`}` + `${pageNum ? `&page=${pageNum}` : `&page=1`}`

            const fetchData = async () => {
                router.push(url);
                const dataResponse = await fetchProducts(url, 4);
                setProducts(dataResponse.products);
                setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
            };
            fetchData();
        }
        else if (category !== -1) {

            setSearchWord("");
            setSelectedEventMenu(-1);

            //shop all
            if (category === 6) {
                let url = `?${sorting ? `sort=${sorting}` : `sort=la`}` + `${pageNum ? `&page=${pageNum}` : `&page=1`}`

                const fetchData = async () => {
                    router.push(url);
                    const dataResponse = await fetchProducts(url, 5);
                    setProducts(dataResponse.products);
                    setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
                };
                fetchData();
            }
            else {
                let url = `?menuCategoryId=${category}` + `${sorting ? `&sort=${sorting}` : `&sort=la`}` + `${pageNum ? `&page=${pageNum}` : `&page=1`}`

                const fetchData = async () => {
                    router.push(url);
                    const dataResponse = await fetchProducts(url, 6);
                    setProducts(dataResponse.products);
                    setPageArray(Array.from({ length: dataResponse.pages }, (_, index) => index + 1))
                };
                fetchData();
            }
        }
    }, [searchWord, category, subCategory, selectedEventMenu, pageNum, sorting]) //do not put Router here

    return (
        <Layout title="Home" hasTabBar>
            <div className="w-full" ref={divRefMenu}>
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
                                <MobileMenu menuCategory={menuCategory} eventDay={eventDay} setSelectedEventMenu={setSelectedEventMenu} setOpenRefine={setOpenRefine} setCategory={setCategory} setSubCategory={setSubCategory} setSearchWord={setSearchWord} setPageNum={setPageNum}></MobileMenu>
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
                            <span onClick={() => { setSorting("la"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "la" ? "underline" : ""}`}>Latest</span>
                            <span onClick={() => { setSorting("pa"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "pa" ? "underline" : ""}`}>Price: Low to high</span>
                            <span onClick={() => { setSorting("pd"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "pd" ? "underline" : ""}`}>Price: High to low</span>
                            <span onClick={() => { setSorting("na"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "na" ? "underline" : ""}`}>Name: Ascending</span>
                            <span onClick={() => { setSorting("nd"); setOpenSort(false) }} className={`text-gray-600 mt-1 cursor-pointer text-xl p-1 hover:border-2 hover:border-dashed hover:font-bold ${sorting === "nd" ? "underline" : ""}`}>Name: Descending</span>
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
                                                        <span onClick={() => {setSearchWord(""); setCategory(menu.id); setSubCategory(-1); setSelectedEventMenu(-1); setPageNum(1); }}
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
                                                                                <span onClick={() => { setSubCategory(submenu.id ?? -1); setPageNum(1) }}
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
                                                onClick={() => { setSelectedEventMenu(day.id); setPageNum(1) }}
                                                className={`text-gray-600 flex mb-1 cursor-pointer text-lg ${selectedEventMenu === day.id ? `underline text-green-700 font-bold` : ""}`} >{day.name}</span>
                                        </div>
                                    ))
                                }

                                <span className="text-gray-600 text-xl font-bold mt-6 mb-4">Sort</span>
                                <span onClick={() => { setSorting("la") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "la" ? "underline" : ""}`}>Latest</span>
                                <span onClick={() => { setSorting("pa") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "pa" ? "underline" : ""}`}>Price: Low to high</span>
                                <span onClick={() => { setSorting("pd") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "pd" ? "underline" : ""}`}>Price: High to low</span>
                                <span onClick={() => { setSorting("na") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "na" ? "underline" : ""}`}>Name: Ascending</span>
                                <span onClick={() => { setSorting("nd") }} className={`text-gray-600 flex mt-1 cursor-pointer text-lg ${sorting === "nd" ? "underline" : ""}`}>Name: Descending</span>
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
                                        stockQuantity={product.stockQuantity}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-center">
                                {
                                    pageArray.length > 1 ?
                                        pageArray
                                            .map((p) =>
                                                <div onClick={() => { setPageNum(p); }} className={`cursor-pointer p-2 m-1 text-sm font-normal text-gray-900 rounded-md ${pageNum === p ? "border bg-gray-300" : "bg-gray-100"}`} key={p}>
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