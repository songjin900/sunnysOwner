import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface InputProps {
    relatedProducts: Product[]
}

export default function RelatedProducts({
    relatedProducts
}: InputProps) {

    return (
        <div className="flex flex-col h-full items-center w-full">
            {relatedProducts && relatedProducts.length > 0 ?
                <div className="text-2xl font-medium">Similar items</div>
                : null
            }
            <div className="grid lg:grid-cols-4 lg:grid-rows-1 grid-cols-2 grid-rows-2 ">
                {relatedProducts.slice(0, 4).map((pro) => (
                    <Link key={pro.id} legacyBehavior href={`/products/${pro.id}`}>
                        <div className="m-1 p-2 flex flex-col rounded-2xl cursor-pointer">
                            <Image
                                width={200}
                                height={200}
                                src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${pro.image}/relatedProducts`}
                                className="rounded-2xl"
                                alt=""
                            />
                            <div className="mt-2 pl-4 border-t-2 p-1">{pro.name}</div>
                            <div className="pl-4">${pro.price}</div>
                        </div>
                    </Link>
                ))
                }
            </div>
        </div>
    );
}