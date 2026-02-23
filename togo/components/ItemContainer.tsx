import type { ReactNode } from 'react';
import React from 'react';

interface ItemContainerProps {
  id: string;
  wishlist: boolean;
  children?: ReactNode;
}

export default function ItemContainer({id, wishlist, children}: ItemContainerProps) {
  return (
    <div>
      <div id={id} className={`flex gap-5 overflow-hidden w-full min-h-18 ${wishlist ? "flex-row" : "flex-col"}`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { wishlistItem: wishlist } as any);
          }
          return child;
        })}
      </div>
      {/* drag and drop card */}
      <div className="w-full h-20 border border-1 border-dashed rounded-lg mt-5 select-none flex items-center justify-center bg-gray-50">
        <h5 className="m-0 text-gray-400 font-normal">+ Drop/Add Places Here</h5>
      </div>
    </div>
  );
}