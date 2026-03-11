"use client";

import MapLocation from "@/types/MapLocation";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FormValues {
  location: MapLocation | null;
  startDate: string | null;
  endDate: string | null;
  users: string[];
}

type PlaceAutocompleteSelectEvent = Event & {
  placePrediction?: google.maps.places.PlacePrediction;
};

interface FormValues {
  tripName: string | null;
  location: MapLocation | null;
  startDate: string | null;
  endDate: string | null;
  users: string[];
}

export default function CreateTrip() {
  const router = useRouter();
  const locationInputRef =
    useRef<google.maps.places.PlaceAutocompleteElement>(null);

  const [formValues, setFormValues] = useState<FormValues>({
    tripName: null,
    location: null,
    startDate: null,
    endDate: null,
    users: [""],
  });

  // updates form values w/ selected location
  useEffect(() => {
    const locationInput = locationInputRef.current;
    if (!locationInput) {
      console.error("locationInputRef.current is null");
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
          location: {
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

    locationInput.addEventListener("gmp-select", onSelect);
    return () => locationInput.removeEventListener("gmp-select", onSelect);
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

    if (!formValues.location) {
      console.warn("No place selected yet");
      return;
    }

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    const data = await res.json();

    router.push(`/trip/${data.tripId}`);
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex-col items-center text-center bg-white rounded-lg shadow-black/75 shadow-lg p-4 pb-15">
        <h2>Create a Trip</h2>
        <br></br>
        <form className="flex flex-col gap-2 w-80" onSubmit={handleSubmit}>
          <label htmlFor="name" className="trip-form-label">
            Trip Name
          </label>
          <input
            type="text"
            name="tripName"
            id="tripName"
            placeholder="ie 'New Year's Trip'"
            onChange={handleChange}
            className="trip-form-input mr-1 w-full"
          ></input>
          <label htmlFor="location">Destination</label>
          <gmp-place-autocomplete
            id="location"
            ref={locationInputRef}
            name="location"
            {...({ placeholder: "E.g. New York" } as any)}
            className="border border-gray-400 rounded-md"
          ></gmp-place-autocomplete>
          <label htmlFor="dates" className="trip-form-label">
            Dates
          </label>
          <div id="dates" className="flex">
            <input
              type="date"
              name="startDate"
              id="startDate"
              placeholder="Start Date"
              onChange={handleChange}
              className="trip-form-input mr-1"
            ></input>
            <input
              type="date"
              name="endDate"
              id="endDate"
              placeholder="End"
              onChange={handleChange}
              className="trip-form-input ml-1"
            ></input>
          </div>
          <button className="text-gray-600 hover:text-blue-500 text-sm text-left mb-10">
            + Invite Trip-Mates
          </button>
          <button className="trip-form-submit">Create Trip</button>
        </form>
      </div>
    </div>
  );
}
