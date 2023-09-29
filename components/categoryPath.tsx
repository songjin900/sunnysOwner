import { MenuCategory, SubMenuCategory } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface InputProps {
    categories?: menuWithSubMenu ;
}

interface menuWithSubMenu extends SubMenuCategory {
    menu?: MenuCategory
}

export default function CategoryPath({ categories }:
    InputProps) {
             
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(-1);
    const [selectedSubCategory, setSelectedSubCategory] = useState("");

    useEffect(()=>{
        if (selectedCategory !== -1){
            router.push(`/shop?menuCategoryId=${selectedCategory}&sort=la`)
        }
    }, [selectedCategory, router])

    useEffect(()=>{
        if (categories && categories.menu){

        }
    },[categories])

    return (
        <div>
            {categories && categories.subCategory && categories.menu ? (
                <div className="flex flex-row space-x-3 pl-2 items-center">
                    <Link legacyBehavior href={`/shop`}>
                        <div className="cursor-pointer text-green-500 text-lg font-medium lowercase">Shop</div>
                    </Link>
                    <div className="text-green-600">&gt;</div>
                        <div onClick={()=>setSelectedCategory(categories.menuCategoryId)} className="cursor-pointer text-green-500 text-lg font-medium lowercase">{categories.menu.categoryDisplay}</div>
                    <div className="text-green-600">&gt;</div>
                    <div className="text-lg text-gray-700 lowercase">{categories.subCategoryDisplay}</div>
                </div>
            ) :
                categories && categories.subCategory ? (
                    <div>
                        <div className="cursor-pointer text-green-500 text-lg font-medium">Shop</div>
                        <div className="text-green-600">&gt;</div>
                        <div className="">{categories.subCategoryDisplay}</div>
                    </div>
                )
                    : null}
        </div>
    );
}
