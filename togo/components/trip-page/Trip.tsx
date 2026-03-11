"use client";

import { useEffect, useState } from "react";
import { ItineraryItemProps } from "@/components/trip-page/ItineraryItem";
import ItemContainer from "@/components/trip-page/ItemContainer";
import ItineraryDay, {
  ItineraryDayProps,
  getItineraryDayId,
} from "@/components/trip-page/ItineraryDay";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TripProps } from "@/app/trip/page";
import TripMap from "./TripMap";
import MapLocation from "@/types/MapLocation";
import Modal from "./Modal";
import AddItem, { AddItemFormSubmitData } from "./AddItem";
import EditTripName from "./EditTripName";
import {
  ActivityDocument,
  addActivity,
  deleteActivity,
  moveActivity,
} from "@/lib/db";

const wishlistContainerId = "wishlistContainer";

interface tripInfoProp {
  tripInfo: TripProps;
  wishlist: ItineraryItemProps[];
  itinerary: ItineraryDayProps[];
  tripId: string;
}

export default function Trip({
  tripInfo,
  wishlist,
  itinerary,
  tripId,
}: tripInfoProp) {
  const [tripName, setTripName] = useState<string>(tripInfo?.tripName ?? "");

  const [wishlistItems, setWishlistItems] =
    useState<ItineraryItemProps[]>(wishlist);
  const [itineraryDays, setItineraryDays] =
    useState<ItineraryDayProps[]>(itinerary);

  // AddItemModel code (popup to add new destination)
  const [addItemModalHidden, setAddItemModalHidden] = useState(true);
  const [titleModalHidden, setTitleModalHidden] = useState(true);
  const [aimOgContainerId, setAimOgContainerId] =
    useState<string>(wishlistContainerId);
  const [addItemModalRenderKey, setAddItemModalRenderKey] = useState(0);

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

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  function handleItemFocus(id: string) {
    setSelectedItemId(id);
  }

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

    // keep item indices in sync with their array positions after reorder
    const normalizedSourceList = sourceList.map((item, index) => ({
      ...item,
      index,
    }));
    const normalizedDestList = destList.map((item, index) => ({
      ...item,
      index,
    }));

    // update source container
    if (source.droppableId === wishlistContainerId) {
      setWishlistItems(normalizedSourceList);
    } else {
      // go through each itinerary day
      setItineraryDays((prev) =>
        prev.map((day) =>
          // if this day was this source container, update list (or else do not change)
          getItineraryDayId(day.date) === source.droppableId
            ? { ...day, items: normalizedSourceList }
            : day,
        ),
      );
    }
    // update destination container
    if (destination.droppableId === wishlistContainerId) {
      setWishlistItems(normalizedDestList);
    } else if (source.droppableId !== destination.droppableId) {
      // go through each itinerary day
      setItineraryDays((prev) =>
        prev.map((day) =>
          // if this day is the destination container, update list
          getItineraryDayId(day.date) === destination.droppableId
            ? { ...day, items: normalizedDestList }
            : day,
        ),
      );
    }

    // Update database
    const movedFirestoreId = movedItem.firestoreId;
    if (movedFirestoreId) {
      const isWishlist = destination.droppableId === wishlistContainerId;
      let dayIndex: number | null = null;

      if (!isWishlist) {
        const destDay = itineraryDays.find(
          (d) => getItineraryDayId(d.date) === destination.droppableId,
        );
        if (destDay) {
          dayIndex = destDay.dayIndex;
        }
      }

      moveActivity(
        tripId,
        movedFirestoreId,
        dayIndex,
        isWishlist,
        destination.index,
      ).catch((err) => console.error("Failed to move activity:", err));
    }
  }

  /**
   * Creates an ItineraryItem and adds it to specified containerId
   * @param location location of item
   * @param containerId id of container
   */
  async function createItineraryItem(
    location: MapLocation,
    containerId: string,
  ) {
    const containerItems = getItemContainerItems(containerId);
    const isWishlistItem = containerId === wishlistContainerId;

    // fetch place description and photo from Google Places API (new)
    let itemDesc = location.displayName;
    let destImg: string | undefined;
    try {
      const place = new google.maps.places.Place({ id: location.locationId });
      await place.fetchFields({ fields: ["editorialSummary", "photos"] });
      if (place.editorialSummary) itemDesc = place.editorialSummary;
      if (place.photos && place.photos.length > 0) {
        destImg = place.photos[0].getURI({ maxWidth: 400 });
      }
    } catch (err) {
      console.error("Failed to fetch place details:", err);
    }

    // create an ItineraryItem with default values
    const itinItem: ItineraryItemProps = {
      firestoreId: "",
      index: isWishlistItem ? 0 : containerItems.length,
      itemName: location.displayName,
      wishlistItem: isWishlistItem,
      itemDesc,
      destImg,
      location,
    };

    const activityPayload: Omit<ActivityDocument, "tripId" | "id"> = {
      index: itinItem.index,
      itemName: itinItem.itemName,
      itemDesc: itinItem.itemDesc,
      destImg: itinItem.destImg,
      location: itinItem.location,
      isWishlist: isWishlistItem,
      day: isWishlistItem
        ? null
        : (itineraryDays.findIndex(
            (day) => getItineraryDayId(day.date) === containerId,
          ) ?? null),
    };
    const fid = await addActivity(tripId, activityPayload);
    itinItem.firestoreId = fid;

    // add ItineraryItem it to container
    if (containerId == wishlistContainerId) {
      // insert at front, shift all existing items' indices right by 1
      setWishlistItems((prev) => [
        itinItem,
        ...prev.map((item) => ({ ...item, index: item.index + 1 })),
      ]);
    } else {
      // append to end
      setItineraryDays((prev) =>
        prev.map((day) =>
          getItineraryDayId(day.date) === containerId
            ? { ...day, items: [...day.items, itinItem] }
            : day,
        ),
      );
    }
  }

  /**
   * Deletes ItineraryItem from its container
   * @param id id of ItineraryItem
   */
  function deleteItineraryItem(id: string) {
    // find item firestoreId before removing from state
    const allItems = [
      ...wishlistItems,
      ...itineraryDays.flatMap((day) => day.items),
    ];
    const item = allItems.find((item) => item.firestoreId === id);
    const firestoreId = item?.firestoreId;

    setWishlistItems((prev) => prev.filter((item) => item.firestoreId !== id));

    setItineraryDays((prev) =>
      prev.map((day) => ({
        ...day,
        items: day.items.filter((item) => item.firestoreId !== id),
      })),
    );

    // Remove from database
    if (firestoreId) {
      deleteActivity(tripId, firestoreId).catch((err) =>
        console.error("Failed to delete activity:", err),
      );
    }
  }

  // takes a function as a parameter, this function must be a set function
  // for a useState variable that controls whether a Modal is hidden
  function closeModal(setter: (bool: boolean) => void) {
    setter(true);
  }

  function displayAddItemModal(originatingContainerId: string) {
    setAimOgContainerId(originatingContainerId);
    setAddItemModalRenderKey((prev) => prev + 1); // re-renders so defaultChecked is updated
    setAddItemModalHidden(false);
  }

  function handleItemCreate(data: AddItemFormSubmitData) {
    data.addedToContainerIds.forEach((id) => {
      createItineraryItem(data.location, id);
    });
    closeModal(setAddItemModalHidden);
  }

  /**
   * calls PATCH to update the current trip's trip name
   * @param event contains form content (new trip name)
   */
  async function editTripName(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const newTripName = String(formData.get("name") ?? "");

    const res = await fetch(`/api/trips`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: tripId, tripName: newTripName }),
    });

    const data = await res.json();
    setTripName(newTripName);
    const form = event.target as HTMLFormElement;
    form.reset();
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex w-full h-screen">
          <div
            id="dashboardContainer"
            className="w-4/10 min-w-1/4 overflow-auto bg-gray-300 no-scrollbar"
          >
            {/* trip name card container */}
            <div className="w-8/10 mx-auto my-8 bg-gray-50 rounded-lg p-3 drop-shadow-lg/60 flex">
              {/* trip name and dates */}
              <div>
                <h1 id="tripName">{tripName}</h1>
                <div className="bg-gray-200 w-fit px-3 py-2 rounded-md my-3 flex gap-2">
                  <img src="/calendar_icon.svg" alt="Calendar icon"></img>
                  <p id="tripDates" className="font-bold">
                    {tripInfo.startDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {tripInfo.endDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {/* edit trip button */}
              <div className="ml-auto mt-3 position-static">
                <button
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => setTitleModalHidden(false)}
                >
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
                tripId={tripId}
                onDisplayAddItemModal={displayAddItemModal}
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
                  tripId={tripId}
                  onDisplayAddItemModal={displayAddItemModal}
                  onItemDelete={deleteItineraryItem}
                  onItemFocus={handleItemFocus}
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
              selectedItemId={selectedItemId}
            ></TripMap>
          </div>
        </div>
      </DragDropContext>
      <Modal
        hidden={addItemModalHidden}
        onClose={() => closeModal(setAddItemModalHidden)}
      >
        <AddItem
          key={addItemModalRenderKey}
          onSubmit={(event) => {
            handleItemCreate(event);
            closeModal(setAddItemModalHidden);
          }}
          wishlistContainerId={wishlistContainerId}
          itineraryDayOptions={itineraryDays}
          defaultCheckedContainerId={aimOgContainerId}
          tripLocation={tripInfo.location}
        />
      </Modal>

      <Modal
        hidden={titleModalHidden}
        onClose={() => closeModal(setTitleModalHidden)}
      >
        <EditTripName
          handleSubmit={(event) => {
            editTripName(event);
            closeModal(setTitleModalHidden);
          }}
        ></EditTripName>
      </Modal>
    </>
  );
}
