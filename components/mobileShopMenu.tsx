import { EventDays, MenuCategory, SubMenuCategory } from '@prisma/client';
import { useState } from 'react';

interface SubMenuWithMenu extends MenuCategory {
  subMenuCategory: SubMenuCategory[]
}

interface MobileMenuProps {
  menuCategory: SubMenuWithMenu[];
  eventDay: EventDays[];
  setSelectedEventMenu: (em: number) => void;
  setOpenRefine: (or: boolean) => void;
  setCategory: (category: number) => void;
  setSubCategory: (subCategory: number) => void;
  setSearchWord: (word: string) => void;
  setPageNum: (page: number) =>void;
}

const MobileMenu = ({ menuCategory, eventDay, setSearchWord, setSelectedEventMenu, setOpenRefine, setCategory, setSubCategory,setPageNum }: MobileMenuProps) => {
  const [openMobileCategory, setOpenMobileCategory] = useState(false);
  const [openMobileEvent, setOpenMobileEvent] = useState(false);

  const [openBouquet, setOpenBouquet] = useState(false);
  const [openIndoor, setOpenIndoor] = useState(false);
  const [openOutdoor, setOpenOutdoor] = useState(false);
  const [openAccessory, setAccessory] = useState(false);
  const [openOrchid, setOrchid] = useState(false);


  const returnState = (category: string) => {
    if (category === 'bouquet') {
      return openBouquet
    }
    else if (category === 'indoor') {
      return openIndoor
    }
    else if (category === 'outdoor') {
      return openOutdoor
    }
    else if (category === 'accessory') {
      return openAccessory
    }
    else if (category === 'orchid') {
      return openOrchid
    }
  }
  const handleMenuArrows = (category: string) => {
    if (category === 'bouquet') {
      return renderArrows(openBouquet)
    }
    else if (category === 'indoor') {
      return renderArrows(openIndoor)
    }
    else if (category === 'outdoor') {
      return renderArrows(openOutdoor)
    }
    else if (category === 'accessory') {
      return renderArrows(openAccessory)
    }
    else if (category === 'orchid') {
      return renderArrows(openOrchid)
    }
  }

  const onClickArrow = (category: string) => {
    if (category === 'bouquet') {
      setOpenBouquet(prev => !prev)
      setOpenIndoor(false)
      setOpenOutdoor(false)
      setAccessory(false)
      setOrchid(false)
    }
    else if (category === 'indoor') {
      setOpenBouquet(false)
      setOpenIndoor(prev => !prev)
      setOpenOutdoor(false)
      setAccessory(false)
      setOrchid(false)
    }
    else if (category === 'outdoor') {
      setOpenBouquet(false)
      setOpenIndoor(false)
      setOpenOutdoor(prev => !prev)
      setAccessory(false)
      setOrchid(false)
    }
    else if (category === 'accessory') {
      setOpenBouquet(false)
      setOpenIndoor(false)
      setOpenOutdoor(false)
      setAccessory(prev => !prev)
      setOrchid(false)
    }
    else if (category === 'orchid') {
      setOpenBouquet(false)
      setOpenIndoor(false)
      setOpenOutdoor(false)
      setAccessory(false)
      setOrchid(prev => !prev)
    }
  }

  const renderArrows = (open: boolean) => {
    return (
      <div>
        {open ? (
          <button className="flex p-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        ) : (
          <button className="flex p-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )
        }
      </div>
    )
  }
  return (
    <div className="h-screen overflow-y-auto">
      <div className="">
        <div className="flex items-center space-x-2">
          <button
            className="text-gray-600 text-xl font-medium my-4"
            onClick={() => { setOpenMobileCategory(!openMobileCategory) }}
          >
            All Categories
          </button>
          {renderArrows(openMobileCategory)}
        </div>
        {menuCategory
          .slice(0)
          .sort((a, b) => (a.categoryIndex ?? 0) > (b.categoryIndex ?? 0) ? 1 : -1)
          .map((menu) => (
            <div key={menu.id} className={`mt-2 ${openMobileCategory ? "block" : "hidden"}`}>
              <div className='flex'>
                <div
                  onClick={() => {
                    menu.category === "all" ? (
                      setSearchWord(""),
                      setCategory(menu.id),
                      setSubCategory(-1),
                      setSelectedEventMenu(-1),
                      setPageNum(1),
                      setOpenRefine(false)
                    ) :
                      (onClickArrow(menu.category))
                  }}
                  className="text-gray-600 my-1 text-xl"
                >
                  {menu.categoryDisplay}
                </div>
                {handleMenuArrows(menu.category)}
              </div>
              {menu.subMenuCategory && returnState(menu.category) ? (
                <>
                  {menu.subMenuCategory
                    .slice(0)
                    .sort((a, b) => (a.subcategoryIndex ?? 0) > (b.subcategoryIndex ?? 0) ? 1 : -1)
                    .map((subMenu) => (
                      <div key={subMenu.id}>
                        <div
                          className="pl-4"
                          onClick={() => {
                            subMenu.platform === "mobile" ?
                              (setCategory(menu.id),
                              setSubCategory(-1)) :
                              setSubCategory(subMenu.id);
                              setSelectedEventMenu(-1);
                              setPageNum(1);
                              setSearchWord("");
                            setOpenRefine(false);
                          }}
                        >
                          {subMenu.subCategoryDisplay}
                        </div>
                      </div>
                    ))}
                </>
              ) : null}
            </div>
          ))}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <button
            className="text-gray-600 text-xl font-medium my-4"
            onClick={() => { setOpenMobileEvent((prev) => !prev) }}
          >
            Shop By Events
          </button>
          {renderArrows(openMobileEvent)}
        </div>
        {eventDay.map((day) => (
          <div key={day.id} className={`mt-2 ${openMobileEvent ? "block" : "hidden"}`}>
            <div
              onClick={() => { setSelectedEventMenu(day.id); setOpenRefine(false) }}
              className={`text-gray-600 cursor-pointer text-xl pl-1 hover:font-bold`}
            >
              {day.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
