"use client";

import MapLocation from "@/types/MapLocation";
import { useEffect, useRef, useState } from "react";



export default function CreateTrip() {
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
    <div className="flex items-center justify-center h-screen">
      <div className="flex-col items-center text-center bg-white rounded-lg shadow-black/75 shadow-lg p-4 pb-15">
        <h1 className="text-2xl font-bold text-black mb-6">Create a Trip</h1>
        <br></br>
        <form className="flex flex-col gap-2 w-80" onSubmit={handleSubmit}>
          <label
            htmlFor="destination"
            className="trip-form-label"
          >
            Destination
          </label>
          <gmp-place-autocomplete
            id="destination"
            ref={destinationInputRef}
            name="destination"
            {...({ placeholder: "E.g. New York" } as any)}
            className="border border-gray-400 rounded-md"
          ></gmp-place-autocomplete>
          <label
            htmlFor="dates"
            className="trip-form-label"
          >
            Dates
          </label>
          <div id="dates" className="flex">
            <input
              type="date"
              id="destination"
              placeholder="Start Date"
              className="trip-form-input mr-1"
            ></input>
            <input
              type="date"
              id="destination"
              placeholder="End"
              className="trip-form-input ml-1"
            ></input>
          </div>
          <button className="text-gray-600 text-sm text-left mb-10">
            + Invite Trip-Mates
          </button>

          <button className="trip-form-submit">
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
