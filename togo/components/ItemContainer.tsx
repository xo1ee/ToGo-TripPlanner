import type { ReactNode } from 'react';

interface ItemContainerProps {
  id: string;
  wishlist: boolean;
  children?: ReactNode;
}

export default function ItemContainer({id, wishlist, children}: ItemContainerProps) {
  return (
    <div id={id} className={`flex gap-5 overflow-hidden w-full min-h-18 ${wishlist ? "flex-row" : "border-1 border-dashed rounded-md"}`}>
      {children}
    </div>
  );
}