import MapLocation from "@/types/MapLocation";
import { useEffect, useRef, useState } from "react";
import { dateFormatter, getItineraryDayId, ItineraryDayProps } from "./ItineraryDay";

export interface AddItemModalProps {
  hidden: boolean;
  onClose: () => void;
  onSubmit: (data: AddItemModalFormSubmitData) => void;
  wishlistContainerId: string;
  itineraryDayOptions: ItineraryDayProps[];
  defaultCheckedContainerId: string;
}

export interface AddItemModalFormSubmitData {
  location: MapLocation;
  addedToWishlist: boolean;
  addedToDayIndicies: number[];
}

export default function AddItemModal(props: AddItemModalProps) {
  if (props.hidden) return null;

  const destinationInputRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapLocation | null>(null);

  useEffect(() => {
    const destInput = destinationInputRef.current;
    if (!destInput) {
      console.error("destinationInputRef.current is null");
      return;
    }

    async function onSelect(event: PlaceAutocompleteSelectEvent) {
      const prediction = event.placePrediction;
      if (!prediction) return;

      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["id", "displayName", "formattedAddress", "location"],
      });

      if (place) {
        setSelectedPlace({
          locationId: place.id,
          displayName: place.displayName ?? "Unknown",
          formattedAddress: place.formattedAddress ?? "",
          locationLat: place.location?.lat() ?? 0,
          locationLon: place.location?.lng() ?? 0
        })
      } else {
        console.error("Failed to fetch Place");
      }
    };

    destInput.addEventListener("gmp-select", onSelect);
    return () => destInput.removeEventListener("gmp-select", onSelect);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPlace) {
      console.warn("No place selected yet");
      return;
    }

    console.log(selectedPlace);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35" onClick={props.onClose}>
      <div className="relative w-11/12 max-w-2xl min-h-80 rounded-xl bg-gray-50 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={props.onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black" aria-label="Close modal">x</button>
        <h3 className="mb-2 text-center">Add Destination</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="destination">Destination</label>
          <gmp-place-autocomplete
            id="destination"
            ref={destinationInputRef}
            name="destination"
            {...({ placeholder: "E.g. New York" } as any)}
            className="border border-gray-400 rounded-md"
          ></gmp-place-autocomplete>
          <br/>

          <label>Select day(s) or Wishlist</label>
          <fieldset>
            <legend className="sr-only">Select day(s) or Wishlist</legend>

            <input id="wishlist" type="checkbox" name="Wishlist" value={props.wishlistContainerId} defaultChecked={props.wishlistContainerId === props.defaultCheckedContainerId} />
            <label htmlFor="wishlist">Wishlist</label>

            {props.itineraryDayOptions.map(day => (
              <div key={getItineraryDayId(day.date)}>
                <input id={getItineraryDayId(day.date)} type="checkbox" name="day" value={getItineraryDayId(day.date)} defaultChecked={getItineraryDayId(day.date) === props.defaultCheckedContainerId}/>
                <label htmlFor={getItineraryDayId(day.date)}>{dateFormatter.format(day.date)}</label>
              </div>
            ))}
          </fieldset>
          <br/>
          
          <button type="submit" className="trip-form-submit">Add</button>
        </form>
      </div>
    </div>
  );
}