import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import SearchBar from "./searchBar";
import useSWR from "swr"
import { SubMenuCategory, MenuCategory, EventDays } from "@prisma/client";
import { getContact } from "@libs/client/contact";

interface LayoutProps {
  title?: string;
  canGoBack?: boolean;
  hasTabBar?: boolean;
  children: React.ReactNode;
  seoTitle?: string;
  brandLogo?: boolean;
  searchIcon?: boolean;
  shoppingCart?: boolean;
  hamburgerMenu?: boolean;
}

interface SubMenuWithMenu extends MenuCategory {
  subMenuCategory: SubMenuCategory[]
}

interface MenuResponse {
  ok: boolean,
  menuCategory: SubMenuWithMenu[]
}

interface EventDaysResponse {
  ok: boolean,
  eventDays: EventDays[]
}

interface QuantityResponse {
  ok: boolean,
  quantity: number
}

export default function Layout({
  title,
  canGoBack,
  hasTabBar,
  children,
  seoTitle,
  brandLogo,
  searchIcon,
  shoppingCart,
  hamburgerMenu,
}: LayoutProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [closeSearchBar, setCloseSearchBar] = useState(false);
  const openSearchBar = (openSearchBar: boolean) => {
    setSearchOpen(openSearchBar);
  }

  const { data: menuCategoryData } = useSWR<MenuResponse>("/api/utils/menucategory");
  const { data: eventDayData } = useSWR<EventDaysResponse>("/api/utils/eventday");

  const renderMenuCategories = (categories: SubMenuWithMenu[]) => {
    return categories
      .slice(0)
      .sort((a, b) => (a.categoryIndex || 0) > (b.categoryIndex || 0) ? 1 : -1)
      .map((menu) => (
        <div key={menu.id} className="mt-2">
          <Link legacyBehavior href={`/shop?menuCategoryId=${menu.id}&sort=la`}>
            <span className="hover:underline text-gray-600 text-base flex mb-1 cursor-pointer">{menu.categoryDisplay}</span>
          </Link>
        </div>
      ));
  };

  const renderMenuEvents = (event: EventDays[]) => {
    return event
      .filter(x => x.visibility === true)
      .map((day) => (
        <div key={day.id} className="mt-2">
          <Link legacyBehavior href={`/shop?eventDaysId=${day.id}`}>
            <span className="hover:underline text-gray-600 text-base flex mb-1 cursor-pointer" >{day.name}</span>
          </Link>
        </div>
      ))
  };

  return (
    <div className="min-h-screen ">
      <Head>
        <title>Sunny&apos;s&nbsp;Flowers-관리잔</title>
      </Head>
      {/* top menu bar */}
      <div className="bg-white static w-full h-12 py-10 justify-between text-lg px-3 font-medium border-b-2 text-gray-800 top-0 flex items-center z-[-1] ">
        <div className="flex space-x-3 items-center">
          <Link legacyBehavior href={`/`}>
            <span className="text-2xl font-bold cursor-pointer">Sunny&apos;s&nbsp;Flowers-관리자</span>
          </Link>
          <Link legacyBehavior href={`/shop`}>
            <span className="hidden p-1 text-base lg:block hover:bg-green-500 hover:text-white hover:rounded-2xl hover:p-1 hover:cursor-pointer">Shop</span>
          </Link>
        </div>
        <div className="flex space-x-3 items-center">
          <Link legacyBehavior href={`/ourStore`}>
            <span className="hidden p-1 text-base lg:block hover:bg-green-500 hover:text-white hover:rounded-2xl hover:p-1 hover:cursor-pointer">Our Store</span>
          </Link>
          <button className="" onClick={() => { setSearchOpen(true) }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 cursor-pointer hover:text-white hover:bg-green-500 hover:rounded-2xl hover:p-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <Link legacyBehavior href={`/cart`}>
            <div className="flex text-xs items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 cursor-pointer hover:text-white hover:bg-green-500 hover:rounded-2xl hover:p-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => { setIsOpen(!isOpen) }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 cursor-pointer hover:bg-green-500 hover:text-white hover:rounded-2xl hover:p-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`z-10 lg:hidden top-0 right-0 fixed bg-white w-full h-full p-10 flex-grow ${isOpen ? `translate-x-0` : `translate-x-full`} ease-in-out duration-300`}>
        <div className="flex justify-end">
          <button onClick={() => setIsOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col w-full pl-3">
          <Link legacyBehavior href={`/shop?sort=la`}>
            <span className="pl-4 mt-5 text-2xl gray cursor-pointer hover:border-2 hover:border-dashed hover:font-bold">Shop</span>
          </Link>
          <Link legacyBehavior href={`/ourStore`}>
            <span className="pl-4 mt-5 text-xl cursor-pointer hover:border-2 hover:border-dashed hover:font-bold">Our Store</span>
          </Link>
          <span className="pl-4 mt-5 text-xl cursor-pointer hover:border-2 hover:border-dashed hover:font-bold">Contact</span>
          <span className="pl-8 mt-2 text-xl cursor-pointer hover:border-2 hover:border-dashed hover:font-bold">Email: {getContact().businessEmail}</span>
          <span className="pl-8 mt-2 text-xl cursor-pointer hover:border-2 hover:border-dashed hover:font-bold">Phone: {getContact().businessPhone}</span>

        </div>
      </div>

      {/* searchBox */}
      <div className={`z-10 top-0 fixed bg-green-400 w-full px-2 left-0 lg:left-[30%] lg:w-[40%] rounded-b-xl flex-grow ${searchOpen ? `translate-y-0` : `-translate-y-full`} ease-in-out duration-300`}>
        <div className="flex justify-end mt-5 mr-5 ">
          <button tabIndex={-1} onClick={() => { setSearchOpen(false); setCloseSearchBar(true) }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SearchBar openSearchBar={openSearchBar} closeSearchBarFromLayout={closeSearchBar} setCloseSearchBar={setCloseSearchBar} />
      </div>
      <div className="p-1 text-center bg-gray-100 text-xs">Minimum Order $35; Free Shipping Over $75+</div>

      <div className="top-0 static pt-0 z-[-2] flex flex-grow min-h-screen">{children}</div>

      <footer className="grid grid-cols-1 md:grid-cols-3 mt-4 border-t-2 h-72 p-4">
        <div className="flex md:justify-center md:border-r-2 mb-5 md:mb-0">
          <div className="">
            <div className="flex flex-row items-center">
              <button className={`flex md:hidden`} onClick={() => { setShopOpen(prev => !prev) }}>
                <div className="text-sm font-semibold text-gray-900 uppercase">Shop</div>
              </button>
              <div className="hidden md:flex text-sm font-semibold text-gray-900 uppercase">Shop</div>
              <div className="flex md:hidden">
                {
                  shopOpen ?
                    <div className="flex p-2" >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </div> :
                    <div className="flex p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                }
              </div>
            </div>

            <>
              <div className={`flex flex-col ${shopOpen ? "block" : "hidden"} md:hidden`}>
                {menuCategoryData && renderMenuCategories(menuCategoryData.menuCategory)}
              </div>
              <div className={`hidden md:flex md:flex-col`}>
                {menuCategoryData && renderMenuCategories(menuCategoryData.menuCategory)}
              </div>
            </>
          </div>
        </div>

        <div className="flex md:justify-center md:border-r-2 mb-5 md:mb-0">
          <div>
            <div className="flex flex-row items-center">
              <button className={`flex md:hidden`} onClick={() => { setEventOpen(prev => !prev) }}>
                <h2 className="text-base font-semibold text-gray-900 ">Shop by Events</h2>
              </button>
              <div className="hidden md:flex text-base font-semibold text-gray-900 ">Shop By Events</div>
              <div className="flex md:hidden">
                {
                  eventOpen ?
                    <div className="flex p-2" >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </div> :
                    <div className="flex p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                }
              </div>
            </div>


            <div className="flex flex-col my-1 gap-y-2">
              <div className={`flex flex-col ${eventOpen ? "block" : "hidden"} md:hidden`}>
                {eventDayData && renderMenuEvents(eventDayData?.eventDays)}
              </div>
              <div className={`hidden md:flex md:flex-col`}>
                {eventDayData && renderMenuEvents(eventDayData?.eventDays)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:justify-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2 flex">About us</h2>
            <div className="flex flex-col my-1 gap-y-2">
              <Link legacyBehavior href={`/ourStore`}>
                <span className="hover:underline text-gray-600 text-base cursor-pointer mb-1">Our Store</span>
              </Link>
              <Link legacyBehavior href={`/terms`}>
                <span className="hover:underline text-gray-600 text-base cursor-pointer mb-1">Our Terms and Conditions</span>
              </Link>
              <span className="text-gray-600 text-base flex mb-1">Contacts</span>
              <span className="text-gray-600 text-base flex mb-1">{getContact().businessEmail}</span>
              <span className="text-gray-600 text-base flex mb-1">{getContact().businessPhone}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}