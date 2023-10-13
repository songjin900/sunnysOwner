import type { NextPage } from "next";
import Layout from "@components/layout";
import Link from "next/link";
import Image from "next/image";
import CategorizedMenu from "@components/cateogrizedMenu";
import { EventDays, MenuCategory, SubMenuCategory } from "@prisma/client";
import { useRef, useState } from 'react';
import LoadingAnimation from "@components/loadingAnimation";
import client from "@libs/server/client";


interface SubMenuWithMenu extends MenuCategory {
    subMenuCategory: SubMenuCategory[]
}

const MainPage: NextPage<{ data: EventDays[]; menuCategoryData: SubMenuWithMenu[] }> = ({ data, menuCategoryData }) => {
    const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

    const divRefEvent = useRef<HTMLDivElement>(null);
    const divRefBouquet = useRef<HTMLDivElement>(null);
    const divRefOrchid = useRef<HTMLDivElement>(null);
    const divRefIndoor = useRef<HTMLDivElement>(null);
    const divRefOutdoor = useRef<HTMLDivElement>(null);
    const divRefAccessory = useRef<HTMLDivElement>(null);


    const scrollToDiv = (category: string) => {
        if (category === "bouquet" && divRefBouquet.current)
            divRefBouquet.current.scrollIntoView({ behavior: 'smooth' })
        else if (category === "indoor" && divRefIndoor.current)
            divRefIndoor.current.scrollIntoView({ behavior: 'smooth' })
        else if (category === "outdoor" && divRefOutdoor.current)
            divRefOutdoor.current.scrollIntoView({ behavior: 'smooth' })
        else if (category === "accessory" && divRefAccessory.current)
            divRefAccessory.current.scrollIntoView({ behavior: 'smooth' })
        else if (category === "event" && divRefEvent.current)
            divRefEvent.current.scrollIntoView({ behavior: 'smooth' })
        else if (category === "orchid" && divRefOrchid.current)
            divRefOrchid.current.scrollIntoView({ behavior: 'smooth' })
    };

    return (
        <Layout hasTabBar title="Main">
            <LoadingAnimation showLoadingAnimation={showLoadingAnimation} />
            <div className={`bg-white w-full ${showLoadingAnimation ? "opacity-30" : "opacity-100"}`}>
                <div className="flex flex-col">
                    <div className="flex">
                        <div className="flex flex-col items-center justify-center w-full space-y-2 p-2">
                            <div className="space-x-1 sm:space-x-4 w-full flex items-center justify-center">
                                <Link legacyBehavior href={`/shop`}>
                                    <button className="md:hidden text-sm sm:text-xl text-center px-2 py-1 text-gray-600 hover:rounded-3xl hover:border-2 hover:border-gray-900 hover:border-dotted hover:py-0">
                                        Shop All
                                    </button>
                                </Link>
                                <button className="md:hidden text-sm sm:text-xl text-center px-2 py-1 text-gray-600 hover:rounded-3xl hover:border-2 hover:border-gray-900 hover:border-dotted hover:py-0" onClick={() => { scrollToDiv("event") }}>
                                    Special Events
                                </button>
                            </div>
                            <div className="flex space-x-1 sm:space-x-4">
                                <Link legacyBehavior href={`/shop`}>
                                    <button className="hidden md:block text-sm sm:text-xl text-center px-1 sm:px-3 py-1 text-gray-600  hover:rounded-3xl hover:border-2 hover:border-gray-900 hover:border-dotted hover:py-0">
                                        Shop All
                                    </button>
                                </Link>
                                <button className="hidden md:block text-sm sm:text-xl text-center px-1 sm:px-3 py-1 text-gray-600 hover:rounded-3xl hover:border-2 hover:border-gray-900 hover:border-dotted hover:py-0" onClick={() => { scrollToDiv("event") }}>
                                    Special Events
                                </button>
                                {
                                    menuCategoryData
                                        .filter(x => x.category !== "all")
                                        .slice(0)
                                        .sort((a, b) => ((a.categoryIndex ?? 0) > (b.categoryIndex ?? 0) ? 1 : -1)).map((menu) => (
                                            <div key={menu.id}>
                                                <button className="text-sm sm:text-xl text-center flex px-1 sm:px-3 py-1 text-gray-600 hover:rounded-3xl hover:border-2 hover:border-gray-900 hover:border-dotted hover:py-0" onClick={() => { scrollToDiv(menu.category) }}>
                                                    {menu.categoryDisplay}
                                                </button>
                                            </div>
                                        ))
                                }
                            </div>
                        </div>
                    </div>

                    <div ref={divRefBouquet}>
                        <CategorizedMenu menuType="bouquet" menuCategory={menuCategoryData} />
                    </div >
                    <div ref={divRefOrchid}>
                        <CategorizedMenu menuType="orchid" menuCategory={menuCategoryData} />
                    </div >
                    <div ref={divRefIndoor}>
                        <CategorizedMenu menuType="indoor" menuCategory={menuCategoryData} />
                    </div>
                    <div ref={divRefOutdoor}>
                        <CategorizedMenu menuType="outdoor" menuCategory={menuCategoryData} />
                    </div>
                    <div ref={divRefAccessory}>
                        <CategorizedMenu menuType="accessory" menuCategory={menuCategoryData} />
                    </div>

                    <div>
                        <div className="text-3xl text-black p-4 bg-white text-center font-medium my-2" ref={divRefEvent}>
                            Special Events
                        </div>
                        <div className="flex lg:flex-row flex-col">
                            {/* mobile */}
                            <div className={`w-full bg-purple-600 h-auto p-2 flex items-center justify-center lg:hidden rounded-2xl`}>
                                <div className="text-center">
                                    <h1 className="text-white text-2xl sm:text-3xl">Shop by Milestones and Make Every Moment Memorable</h1>
                                    <Link legacyBehavior href={`/shop`}>
                                        <button className="py-1 px-4 mt-3 text-white border border-white rounded-2xl shadow-sm font-medium focus:ring-2 focus:ring-offset-1 focus:ring-green-500 focus:outline-none text-base">Shop</button>
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full">
                                <div className={`h-full grid grid-cols-2 
                                ${data && data.length >= 5 ? `md:grid-cols-6 md:grid-rows-2 ` 
                                    : data &&data.length >= 4 ? "md:grid-cols-5 md:grid-rows-1"
                                    : `md:grid-cols-4 md:grid-rows-1`}`}>
                                    {
                                        data && data.length > 0 ?
                                            data.slice(0, 8).sort((a, b) => (
                                                a.eventIndex > b.eventIndex ? 1 : -1
                                            ))
                                                .map((day) =>
                                                    <div key={day.eventIndex} className="h-full rounded-3xl p-1 md:p-3 overflow-hidden">
                                                        <Link legacyBehavior href={`/shop?eventDaysId=${day.id}`}>
                                                            <div className={`h-full items-center flex flex-col justify-center p-2 bg-[#F4F4F4] md:hover:-translate-y-5 rounded-3xl cursor-pointer flex-1`}>
                                                                <Image
                                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${day.image}/indexImage`}
                                                                    width={250}
                                                                    height={250}
                                                                    alt=""
                                                                    className="bg-[#F4F4F4] rounded-2xl"
                                                                />
                                                                <div className="flex p-1">
                                                                    <div className="text-black text-lg">{day.name}</div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )
                                            : null
                                    }
                                    {
                                        data && data.length > 0 ?
                                            <div className="h-full rounded-3xl p-1 md:p-3">
                                                <Link legacyBehavior href={`/shop`}>
                                                    <div className={`h-full items-center flex flex-col justify-center p-2 bg-[#F4F4F4] hover:-translate-y-5 rounded-3xl cursor-pointer flex-1`}>                                                    
                                                        <div className="flex p-1">
                                                            <div className="text-black text-lg">Show All</div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>

                                            : (
                                                null
                                            )
                                    }
                                </div>
                            </div>
                            <div className={`w-1/3 bg-purple-600 h-auto m-3 lg:flex items-center justify-center hidden rounded-3xl`}>
                                <div className="text-center">
                                    <h1 className="text-white text-3xl">Shop by Milestones and Make Every Moment Memorable</h1>
                                    <Link legacyBehavior href={`/shop`}>
                                        <button className="py-1 px-4 mt-3 text-white border border-white rounded-2xl shadow-sm font-medium focus:ring-2 focus:ring-offset-1 focus:ring-green-500 focus:outline-none text-base">Shop</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export const getServerSideProps = async () => {
    const eventDays = await client.eventDays.findMany({
        where: {
            visibility: true
        }
    })
    const menuCategory = await client.menuCategory.findMany({
        where: {
            visibility: true
        },
        include: {
            subMenuCategory: true,
        },
    })

    return {
        props: {
            data: JSON.parse(JSON.stringify(eventDays)),
            menuCategoryData: JSON.parse(JSON.stringify(menuCategory))
        }
    }
}

export default MainPage;