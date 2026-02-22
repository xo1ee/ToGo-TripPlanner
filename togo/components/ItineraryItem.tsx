interface ItineraryItemProps {
  id: number;
  wishlistItem?: boolean; // passed in through ItemContainer
  destName: string;
  destDesc: string;
  destImg: string;
  itemNote?: string;
}

export default function ItineraryItem({ id, wishlistItem, destName, destDesc, destImg, itemNote }: ItineraryItemProps) {
  return (
    <div className={`bg-gray-50 rounded-lg border-1 border-dashed overflow-hidden ${wishlistItem ? "w-55 h-18" : "w-full min-h-20"}`}>
      {/* main destination details */}
      <div className="flex flex-nowrap justify-between items-center h-full">
        <img src={destImg} className="h-full w-20 object-cover shrink-0" />
        <div className="ml-2 min-w-0 flex-1">
          <h5 className="m-0 line-clamp-3">{destName}</h5>
          <p className="truncate" hidden={wishlistItem}>{destDesc}</p>
        </div>
        <img src="/drag_icon.svg" className="w-10 h-10 grow-0" />
      </div>

      {/* notes container */}
      <div className="border-t-1 border-dashed overflow-hidden" hidden={wishlistItem || !itemNote}>
        <div className="flex gap-2 my-1">
          <img className="ml-2" src="/note_icon.svg" alt="Note icon"></img>
          <p className="bg-gray-100 rounded-lg px-3 py-1 truncate">{itemNote}</p>
        </div>
      </div>
    </div>
  );
}