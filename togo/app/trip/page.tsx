'use client';

import { useEffect } from 'react';
import WishlistItem from '@/components/WishlistItem';

export default function Trip() {
  // split screen resizing logic
  useEffect(() => {
    const dashboardContainer = document.getElementById('dashboardContainer');
    const handle = document.getElementById('resize-handle');
    const mapContainer = document.getElementById('mapContainer');

    if (dashboardContainer === null || handle === null || mapContainer === null) {
      console.log("Failed to get one or more elements by ID");
      return;
    }

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = dashboardContainer.offsetWidth;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent): void => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      dashboardContainer.style.width = `${newWidth}px`;
    };

    handle.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    // remove afterward to prevent multiple listeners from potentially building up
    return () => {
      handle.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="flex w-full h-screen select-none">
      <div id="dashboardContainer" className="w-4/10 min-w-1/4 overflow-auto bg-gray-300">
        {/* trip name card container */}
        <div className="w-8/10 mx-auto my-8 bg-gray-50 rounded-lg p-3 drop-shadow-lg/60">
          <h1 id="tripName">Trip to New York</h1>
          {/* trip dates container */}
          <div className="bg-gray-200 w-fit px-3 py-2 rounded-md my-3 flex gap-2">
            <img src="/calendar_icon.svg" alt="Calendar icon"></img>
            <p id="tripDates" className="font-bold">2/16 - 2/20</p>
          </div>
        </div>

        {/* trip info */}
        <div className="w-8/10 mx-auto">
          <h2>Itinerary</h2>
          <h5><span className="text-green-600">Wishlist</span> - Drag items below into your itinerary</h5>
          {/* wishlist container */}
          <div id="wishlistContainer" className="flex gap-5 overflow-hidden">
            <WishlistItem destName="Central Place" destImg="/img_placeholder.svg" />
            <WishlistItem destName="Empire State Building" destImg="/img_placeholder.svg" />
          </div>
        </div>


        {/* trip days */}
        <div>

        </div>
      </div>
      <div id="resize-handle" className="w-1.5 bg-gray-600 hover:bg-gray-400 cursor-col-resize"></div>
      <div id="mapContainer" className="flex-1 min-w-1/10 overflow-hidden bg-sky-100">

      </div>
    </div>
  );
}