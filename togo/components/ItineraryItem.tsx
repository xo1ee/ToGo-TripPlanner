import { useState } from "react";

interface ItineraryItemProps {
  id: number;
  wishlistItem?: boolean; // passed in through ItemContainer
  destName: string;
  destDesc: string;
  destImg: string;
  itemNote?: string;
}

export default function ItineraryItem({ id, wishlistItem, destName, destDesc, destImg, itemNote }: ItineraryItemProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== "/img_placeholder.svg") {
      img.src = "/img_placeholder.svg";
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  function expandItem() {
    setIsExpanded(prev => !prev);
  }

  return (
    <div className={`bg-gray-50 rounded-lg border-1 border-dashed overflow-hidden ${wishlistItem ? "w-55 h-18 flex-none" : "w-full min-h-20"}`}>
      {/* main destination details */}
      <div className="flex flex-nowrap justify-between items-center h-full">
        <img src={destImg} onError={handleImageError} className="h-20 w-20 object-cover shrink-0" />
        <button onClick={expandItem} className="text-start select-text">
          <div className="ml-2 min-w-0 flex-1">
            <h5 className="m-0 line-clamp-3">{destName}</h5>
            <p className="text-xs line-clamp-3" hidden={wishlistItem}>{destDesc}</p>
          </div>
        </button>
        <img src="/drag_icon.svg" className="w-10 h-10 grow-0" />
      </div>

      {/* notes container */}
      <div className="border-t-1 border-dashed overflow-hidden" hidden={isExpanded ? false : wishlistItem || !itemNote}>
        <div className="flex gap-2 my-1">
          <img className="ml-2" src="/note_icon.svg" alt="Note icon"></img>
          <p className="bg-gray-100 rounded-lg px-3 py-1 truncate">{itemNote}</p>
        </div>
      </div>

      {/* extra details */}
      <div className="border-t-1 border-dashed overflow-hidden px-2 py-1" hidden={!isExpanded}>
        <p>one day there will be details here</p>
      </div>
    </div>
  );
}