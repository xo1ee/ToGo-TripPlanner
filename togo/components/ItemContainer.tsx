import type { ReactNode } from 'react';
import React from 'react';

interface ItemContainerProps {
  id: string;
  wishlist: boolean;
  children?: ReactNode;
}

export default function ItemContainer({id, wishlist, children}: ItemContainerProps) {
  return (
    <div id={id} className={`flex gap-5 overflow-hidden w-full min-h-18 ${wishlist ? "flex-row" : "flex-col border-1 border-dashed rounded-md"}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { wishlistItem: wishlist } as any);
        }
        return child;
      })}
    </div>
  );
}