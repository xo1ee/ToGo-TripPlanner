interface WishlistItemProps {
  destName: string;
  destImg: string;
}

export default function WishlistItem({destName, destImg}: WishlistItemProps) {
  return (
    <div className="bg-gray-50 min-w-55 max-w-64 h-18 flex flex-nowrap justify-between items-center rounded-lg overflow-hidden">
      <img src={destImg} className="h-full w-20 object-cover shrink-0" />
      <h5 className="m-2">{destName}</h5>
      <img src="/drag_icon.svg" className="w-10 h-10 grow-0" />
    </div>
  );
}