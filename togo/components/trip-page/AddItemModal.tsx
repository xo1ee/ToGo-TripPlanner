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
  tripLocation: MapLocation;
}

export interface AddItemModalFormSubmitData {
  location: MapLocation;
  addedToContainerIds: string[];
}

export default function AddItemModal(props: AddItemModalProps) {
  const destinationInputRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);
  const inputDaySelectionFieldset = useRef<HTMLFieldSetElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapLocation | null>(null);

  useEffect(() => {
    if (props.hidden) return;

    const destInput = destinationInputRef.current;
    if (!destInput) {
      console.warn("destinationInputRef.current is null");
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
  }, [props.hidden, props.tripLocation.locationLat, props.tripLocation.locationLon]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPlace) {
      console.warn("No place selected yet");
      return;
    }

    const formInputElements =
      inputDaySelectionFieldset.current?.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]',
      ) ?? [];

    const addedToContainerIds = Array.from(formInputElements)
      .filter((input) => input.checked)
      .map((input) => input.name);

    props.onSubmit({
      location: selectedPlace,
      addedToContainerIds,
    });
  }

  return (
    <div hidden={props.hidden} className="fixed inset-0 z-50 flex items-center justify-center bg-black/35" onClick={props.onClose}>
      <div className="relative w-11/12 max-w-2xl min-h-80 rounded-xl bg-gray-50 p-6 shadow-2xl border" onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={props.onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black" aria-label="Close modal">x</button>
        <h3 className="mb-2 text-center">Add Destination</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="destination">Destination</label>
          <gmp-place-autocomplete
            id="destination"
            ref={destinationInputRef}
            name="destination"
            {...({
              placeholder: "E.g. New York",
              locationBias: {
                center: {
                  lat: props.tripLocation.locationLat,
                  lng: props.tripLocation.locationLon,
                },
                radius: 50000,
              },
            } as any)}
            className="border border-gray-400 rounded-md"
          ></gmp-place-autocomplete>
          <br/>

          <label>Select day(s) or Wishlist</label>
          <fieldset ref={inputDaySelectionFieldset}>
            <legend className="sr-only">Select day(s) or Wishlist</legend>

            
            <label className="flex items-center gap-2">
              <input type="checkbox" name="Wishlist" value={props.wishlistContainerId} defaultChecked={props.wishlistContainerId === props.defaultCheckedContainerId} />
              Wishlist
            </label>

            {props.itineraryDayOptions.map(day => (
              <label key={`aimOption-${getItineraryDayId(day.date)}`} className="flex items-center gap-2">
                <input type="checkbox" name={getItineraryDayId(day.date)} value={getItineraryDayId(day.date)} defaultChecked={getItineraryDayId(day.date) === props.defaultCheckedContainerId}/>
                {dateFormatter.format(day.date)}
              </label>
            ))}
          </fieldset>
          <br/>
          
          <div className="flex justify-center">
            <button type="submit" className="trip-form-submit cursor-pointer w-8/10">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}