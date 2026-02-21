interface ItineraryItemProps {
  id: number;
  wishlistItem?: boolean; // passed in through ItemContainer
  destName: string;
  destDesc: string;
  destImg: string;
}

export default function ItineraryItem({ id, wishlistItem, destName, destDesc, destImg }: ItineraryItemProps) {
  let widthClass;
  let heightClass;

  if (wishlistItem) {
    widthClass = 'w-55';
    heightClass = 'h-18';
  } else {
    widthClass = 'w-full';
    heightClass = 'h-24';
  }

  return (
    <div
      className={`bg-gray-50 flex flex-nowrap justify-between items-center rounded-lg overflow-hidden flex-none ${widthClass} ${heightClass}`}
    >
      <img src={destImg} className="h-full w-20 object-cover shrink-0" />
      <div className="ml-2 min-w-0 flex-1">
        <h5 className="m-0 line-clamp-3">{destName}</h5>
        <p className="truncate" hidden={wishlistItem}>{destDesc}</p>
      </div>
      <img src="/drag_icon.svg" className="w-10 h-10 grow-0" />
    </div>
  );
}