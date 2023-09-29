import Image from "next/image";
import { useEffect, useState } from "react";

interface slidesInterface {
    image: string;
    orderIndex: number;
}

interface InputProps {
    imageSlides: slidesInterface[]
}

export default function ImageSlides({
    imageSlides
}: InputProps) {

    const [slides, setSlides] = useState(imageSlides ?? null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [zoom, setZoom] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50

    const onTouchStart = (e: any) => {
        setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: any) => setTouchEnd(e.targetTouches[0].clientX)

    const onTouchEnd = () => {
        const index = slides?.findIndex(item => item.image === selectedImage);

        if (index === -1)
            return;

        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isRightSwipe) {
            if (index === 0)
                setSelectedImage(slides[slides.length - 1].image)
            else
                setSelectedImage(slides[index + -1].image)
        }

        if (isLeftSwipe) {
            if (index + 1 === slides.length)
                setSelectedImage(slides[0].image)
            else
                setSelectedImage(slides[index + 1].image)
        }
    }

    useEffect(() => {
        if (imageSlides && imageSlides.length > 0) {
            const orderImage = imageSlides.slice(0).sort((a, b) =>
                (a.orderIndex > b.orderIndex ? 1 : -1)
            )
            setSlides(orderImage)
            setSelectedImage(orderImage[0].image)
        }
    }, [imageSlides])

    const onRightArrowClicked = () => {
        const index = slides?.findIndex(item => item.image === selectedImage);
        if (index === -1)
            return;

        if (index + 1 === slides.length)
            setSelectedImage(slides[0].image)
        else
            setSelectedImage(slides[index + 1].image)

    }
    const onLeftArrowClicked = () => {
        const index = slides?.findIndex(item => item.image === selectedImage);
        if (index === -1)
            return;

        if (index === 0)
            setSelectedImage(slides[slides.length - 1].image)
        else
            setSelectedImage(slides[index + -1].image)
    }

    return (
        <div className="flex flex-col h-full items-center w-full">
            <div className="w-full">
                <div className="flex">
                    {slides && slides.length > 0 ? (
                        <div className={`relative overflow-hidden transition-transform duration-300 transform ${zoom ? "scale-125 -translate-y-10" : "scale-100 translation-y-0"}`}>
                            <Image
                                src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${selectedImage}/productId`}
                                width={400} //400
                                height={400} //600
                                alt=""
                                loading="lazy"
                                className={`rounded-3xl object-fill ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                                onClick={() => { setZoom(prev => !prev) }}
                                onMouseLeave={() => { setZoom(false) }}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            //https://stackoverflow.com/questions/70612769/how-do-i-recognize-swipe-events-in-react
                            />
                        </div>
                    ) : null
                    }
                </div>
            </div>
            <div className="flex flex-row items-center">
                <button className=" text-black cursor-pointer" onClick={() => onLeftArrowClicked()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                {
                    slides?.map((img) => (
                        <div key={img.image} onClick={() => setSelectedImage(img.image)} className="flex mx-1 my-4">
                            <Image
                                src={`https://imagedelivery.net/F5uyA07goHgKR71hGfm2Tg/${img.image}/imageSlide`}
                                width={75}
                                height={75}
                                alt=""
                                className={`${selectedImage === img.image ? 'border-green-500' : 'border-gray-300'} border-2 rounded-xl cursor-pointer`}
                                loading="lazy"
                            />
                        </div>
                    ))
                }
                <button className="text-black cursor-pointer" onClick={() => onRightArrowClicked()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>
    );
}