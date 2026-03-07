"use client";

import { useEffect, useState } from "react";
import {
  ItineraryItemProps,
  MapLocation,
} from "@/components/trip-page/ItineraryItem";
import ItemContainer from "@/components/trip-page/ItemContainer";
import ItineraryDay, {
  ItineraryDayProps,
  getItineraryDayId,
} from "@/components/trip-page/ItineraryDay";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TripProps } from "@/app/trip/page";
import TripMap from "./TripMap";

const wishlistContainerId = "wishlistContainer";

interface tripInfo {
  tripInfo: TripProps;
  wishlist: ItineraryItemProps[];
  itinerary: ItineraryDayProps[];
}

export default function Trip({ tripInfo, wishlist, itinerary }: tripInfo) {
  // split screen resizing logic
  useEffect(() => {
    const dashboardContainer = document.getElementById("dashboardContainer");
    const handle = document.getElementById("resize-handle");
    const mapContainer = document.getElementById("mapContainer");

    if (!dashboardContainer || !handle || !mapContainer) {
      console.error(
        "Failed to get one or more base-level container elements by ID",
      );
      return;
    }

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = dashboardContainer.offsetWidth;
      document.documentElement.classList.add("select-none");
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.documentElement.classList.remove("select-none");
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

  const [wishlistItems, setWishlistItems] =
    useState<ItineraryItemProps[]>(wishlist);
  const [itineraryDays, setItineraryDays] =
    useState<ItineraryDayProps[]>(itinerary);

  /**
   * Get ItineraryItems from ID of ItineraryDay/Wishlist
   * @param id id of ItineraryDay of Wishlist id
   * @returns ItineraryDayProps[] of that container
   */
  function getItemContainerItems(id: string) {
    return id === wishlistContainerId
      ? wishlistItems
      : itineraryDays.find((d) => getItineraryDayId(d.date) === id)?.items ||
          [];
  }
  // drag and drop logic
  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    // if no destsination, return
    if (!destination) return;

    // get list of all ItineraryItems in both source container and destination container
    const sameContainer = source.droppableId === destination.droppableId; // true if item didn't move containers
    const sourceList = [...getItemContainerItems(source.droppableId)];
    const destList = sameContainer
      ? sourceList
      : [...getItemContainerItems(destination.droppableId)];

    // remove ItineraryItem from source list
    const [movedItem] = sourceList.splice(source.index, 1);
    // add ItineraryItem to dest list
    destList.splice(destination.index, 0, movedItem);

    // update source container
    if (source.droppableId === wishlistContainerId) {
      setWishlistItems(sourceList);
    } else {
      // go through each itinerary day
      setItineraryDays((prev) =>
        prev.map((day) =>
          // if this day was this source container, update list (or else do not change)
          getItineraryDayId(day.date) === source.droppableId
            ? { ...day, items: sourceList }
            : day,
        ),
      );
    }
    // update destination container
    if (destination.droppableId === wishlistContainerId) {
      setWishlistItems(destList);
    } else if (source.droppableId !== destination.droppableId) {
      // go through each itinerary day
      setItineraryDays((prev) =>
        prev.map((day) =>
          // if this day is the destination container, update list
          getItineraryDayId(day.date) === destination.droppableId
            ? { ...day, items: destList }
            : day,
        ),
      );
    }

    // TODO: update database
  }

  /**
   * Creates an ItineraryItem and adds it to specified containerId
   * @param location location of item
   * @param containerId id of container
   */
  function createItineraryItem(location: MapLocation, containerId: number) {
    // TODO: create an ItineraryItem and add it to container
    // TODO: add marker to map
  }

  /**
   * Deletes ItineraryItem from its container
   * @param id id of ItineraryItem
   */
  function deleteItineraryItem(id: number) {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));

    setItineraryDays((prev) =>
      prev.map((day) => ({
        ...day,
        items: day.items.filter((item) => item.id !== id),
      })),
    );

    // TODO: remove itinerary item with id from database
    // TODO: remove items marker from map
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex w-full h-screen">
        <div
          id="dashboardContainer"
          className="w-4/10 min-w-1/4 overflow-auto bg-gray-300  no-scrollbar"
        >
          {/* trip name card container */}
          <div className="w-8/10 mx-auto my-8 bg-gray-50 rounded-lg p-3 drop-shadow-lg/60 flex">
            {/* trip name and dates */}
            <div>
              <h1 id="tripName"> {tripInfo.tripName}</h1>
              <div className="bg-gray-200 w-fit px-3 py-2 rounded-md my-3 flex gap-2">
                <img src="/calendar_icon.svg" alt="Calendar icon"></img>
                <p id="tripDates" className="font-bold">
                  {tripInfo.startDate.toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}{" "}
                  -{" "}
                  {tripInfo.endDate.toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </p>
              </div>
            </div>
            {/* edit trip button */}
            <div className="ml-auto mt-3 position-static">
              <button className="h-7 w-7 cursor-pointer">
                <img src="/menu_vertical_icon.svg" alt="Edit Trip Icon" />
              </button>
            </div>
          </div>

          {/* trip info */}
          <div className="w-8/10 mx-auto">
            <h2>Itinerary</h2>
            <h5>
              <span className="text-green-600">Wishlist</span> - Drag items
              below into your itinerary
            </h5>
            {/* wishlist container */}
            <ItemContainer
              id={wishlistContainerId}
              wishlist={true}
              items={wishlistItems}
              onItemCreate={createItineraryItem}
              onItemDelete={deleteItineraryItem}
            />
          </div>

          {/* trip days */}
          <div
            id="itineraryDaysContainer"
            className="w-8/10 mx-auto flex flex-col gap-8 mt-10 mb-10"
          >
            {itineraryDays.map((dayContainer) => (
              <ItineraryDay
                key={getItineraryDayId(dayContainer.date)}
                {...dayContainer}
                onItemCreate={createItineraryItem}
                onItemDelete={deleteItineraryItem}
              />
            ))}
          </div>
        </div>
        <div
          id="resize-handle"
          className="w-1.5 bg-gray-600 hover:bg-gray-400 cursor-col-resize"
        ></div>
        <div
          id="mapContainer"
          className="flex-1 min-w-1/10 overflow-hidden bg-sky-100"
        >
          <TripMap
            lat={tripInfo.location.locationLat}
            lon={tripInfo.location.locationLon}
            itinerary={itineraryDays}
          ></TripMap>
        </div>
      </div>
    </DragDropContext>
  );
}
