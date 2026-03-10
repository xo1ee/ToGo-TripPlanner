"use client";

import MapLocation from "@/types/MapLocation";
import { useEffect, useRef, useState } from "react";

type PlaceAutocompleteSelectEvent = Event & {
  placePrediction?: google.maps.places.PlacePrediction;
};

interface FormValues {
  destination: MapLocation | null;
  startDate: string | null;
  endDate: string | null;
  users: string[];
}

export default function CreateTrip() {
  const destinationInputRef =
    useRef<google.maps.places.PlaceAutocompleteElement>(null);

  const [formValues, setFormValues] = useState<FormValues>({
    destination: null,
    startDate: null,
    endDate: null,
    users: [""],
  });

  // updates form values w/ selected location
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
        setFormValues((prev) => ({
          ...prev,
          destination: {
            locationId: place.id,
            displayName: place.displayName ?? "Unknown",
            formattedAddress: place.formattedAddress ?? "",
            locationLat: place.location?.lat() ?? 0,
            locationLon: place.location?.lng() ?? 0,
          },
        }));
      } else {
        console.error("Failed to fetch Place");
      }
    }

    destInput.addEventListener("gmp-select", onSelect);
    return () => destInput.removeEventListener("gmp-select", onSelect);
  }, []);

  // updates remaining form values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.destination) {
      console.warn("No place selected yet");
      return;
    }

    await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    // debugging prints
    // console.log("Values:", formValues);
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex-col items-center text-center bg-white rounded-lg shadow-black/75 shadow-lg p-4 pb-15">
        <h1 className="text-2xl font-bold text-black mb-6">Create a Trip</h1>
        <br></br>
        <form className="flex flex-col gap-2 w-80" onSubmit={handleSubmit}>
          <label
            htmlFor="destination"
            className="text-black font-bold font-medium text-left"
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
            className="text-black font-bold font-medium text-left"
          >
            Dates
          </label>
          <div id="dates" className="flex">
            <input
              type="date"
              name="startDate"
              id="startDate"
              placeholder="Start Date"
              onChange={handleChange}
              className="border border-gray-400 pl-2 mr-1 rounded-md w-1/2"
            ></input>
            <input
              type="date"
              name="endDate"
              id="endDate"
              placeholder="End"
              onChange={handleChange}
              className="border border-gray-400 pl-2 ml-1 rounded-md w-1/2"
            ></input>
          </div>
          <button className="text-gray-600 hover:text-blue-500 text-sm text-left mb-10">
            + Invite Trip-Mates
          </button>

          <button className="bg-[#839F5D] text-white font-bold rounded-full pt-1 pb-1 pl-4 pr-4">
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
