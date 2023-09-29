import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MenuCategory, SubMenuCategory } from "@prisma/client";

interface SubMenuWithMenu extends MenuCategory {
    subMenuCategory: SubMenuCategory[]
}

interface InputPros {
    menuType: string,
    menuCategory: SubMenuWithMenu[]
}

export default function CategorizedMenu({
    menuType, menuCategory
}: InputPros) {
    const [menu, setMenu] = useState<SubMenuWithMenu>();

    useEffect(() => {
        if (menuCategory) {
            const menuTemp = menuCategory
                .filter((menu) => menu.category === menuType).at(0)
            setMenu(menuTemp);
        }
    }, [menuCategory, menuType])

    return (
        
        <>{
        menu? (
            <div>
                <div className="text-4xl mb-5 mt-12 text-black bg-white text-center font-medium">
                    {menu && menu.categoryDisplay}
                </div>
                <div className="flex lg:flex-row flex-col">
                    {/* mobile */}
                    <div className={`w-full ${menu?.category === "bouquet" ? "bg-[#FFA8B6]" : menu?.category === "indoor" ? "bg-[#7ACD7C]" : menu?.category === "outdoor" ? "bg-[#66CC66]" : menu?.category === "accessory" ? "bg-[#ffb845]" : "bg-[#DA70D6]"} 
                     h-auto flex items-center justify-center lg:hidden rounded-2xl`}>
                        <div className="text-center p-2">
                            <h1 className="text-white text-3xl ">{menu?.description}</h1>
                            <Link legacyBehavior href={`/shop?menuCategoryId=${menu?.id}`}>
                                <button className="py-1 px-4 mt-3 text-white border border-white rounded-2xl shadow-sm font-medium focus:ring-2 focus:ring-offset-1 focus:ring-white focus:outline-none text-base">Shop All {menu?.categoryDisplay}</button>
                            </Link>
                        </div>
                    </div>
                    <div className="w-full">
                        {
                            !menu ?
                                <div className={`grid md:grid-cols-2 grid-cols-2 md:grid-rows-2 h-full p-2`}>
                                    {
                                        [1, 2, 3, 4].map((num) =>
                                            <div key={num} className=" rounded-2xl m-2 bg-gray-200 h-[260px]" />
                                        )
                                    }
                                </div>
                                :
                                <div className={`grid md:grid-cols-4 grid-cols-2 h-full ${menu && menu.subMenuCategory.length > 4 ? `md:grid-rows-2 grid-rows-3` : menu && menu.subMenuCategory.length > 2 ? `md:grid-rows-1 grid-rows-2` : `grid-rows-1`}`}>
                                    {
                                        menu && menu.subMenuCategory.length > 0 ?
                                            menu.subMenuCategory
                                                .slice(0, 7)
                                                .sort((a, b) => (a.subcategoryIndex ?? 0) > (b.subcategoryIndex ?? 0) ? 1 : -1)
                                                .filter(x => x.platform === "both")
                                                .map((subMenu) =>
                                                    <div key={subMenu.id} className="h-full rounded-3xl p-1 md:p-3">
                                                        <Link legacyBehavior href={`/shop?menuCategoryId=${menu?.id}&subMenuCategoryId=${subMenu?.id}`}>
                                                            <div className={`h-full items-center flex flex-col justify-center p-2 bg-[#F4F4F4] md:hover:-translate-y-5 rounded-3xl cursor-pointer flex-1`}>
                                                                <Image
                                                                    src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${subMenu.image}/indexImage`}
                                                                    width={250}
                                                                    height={250}
                                                                    alt=""
                                                                    loading="lazy"
                                                                    className="bg-[#F4F4F4] rounded-2xl"
                                                                />
                                                                <div className="flex p-1">
                                                                    <div className="text-black text-lg">{subMenu.subCategoryDisplay}</div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )
                                            : (
                                                null
                                            )
                                    }
                                    {
                                        menu && menu.subMenuCategory.length > 0 ?
                                                <div key={menu.id} className="h-full rounded-3xl p-1 md:p-3">
                                                        <Link legacyBehavior href={`/shop?menuCategoryId=${menu?.id}`}>
                                                            <div className={`h-full items-center flex flex-col justify-center p-2 bg-[#F4F4F4] md:hover:-translate-y-5 rounded-3xl cursor-pointer flex-1`}>
                                                                <div className="flex p-1">
                                                                    <div className="text-black text-lg">Shop All {menu.categoryDisplay}</div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>

                                            : (
                                                null
                                            )
                                    }
                                </div>
                        }
                    </div>
                    <div className={`w-1/3 ${menu?.category === "bouquet" ? "bg-[#FFA8B6]" : menu?.category === "indoor" ? "bg-[#7ACD7C]" : menu?.category === "outdoor" ? "bg-[#66CC66]" : menu?.category === "accessory" ? "bg-[#ffb845]" : "bg-[#DA70D6]"} m-3 h-auto lg:flex items-center justify-center hidden rounded-3xl`}>
                        <div className="text-center">
                            <h1 className="text-white text-3xl">{menu?.description}</h1>
                            <p className="text-white text-1xl p-2">{menu?.subDescription}</p>
                            <Link legacyBehavior href={`/shop?menuCategoryId=${menu?.id}`}>
                                <button className="py-1 px-4 mt-3 text-white border border-white rounded-2xl shadow-sm font-medium focus:ring-2 focus:ring-offset-1 focus:ring-white focus:outline-none text-base">Shop All {menu?.categoryDisplay}</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
        ): null }</>
    );
}
