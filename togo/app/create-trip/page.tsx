"use client";

import MapLocation from "@/types/MapLocation";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createTripForUsers, daysBetween } from "@/lib/db";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";

type PlaceAutocompleteSelectEvent = Event & {
  placePrediction?: google.maps.places.PlacePrediction;
};

interface FormValues {
  tripName: string | null;
  location: MapLocation | null;
  startDate: Date | null;
  endDate: Date | null;
}

export default function CreateTrip() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const locationInputRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);
  const previousUserRef = useRef(user); // tracks login state
  const [formErrorMsg, setFormErrMsg] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<FormValues>({
    tripName: null,
    location: null,
    startDate: null,
    endDate: null,
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

      try {
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
      } catch (err) {
        console.error("Failed to process selected destination:", err);
      }
    }

    locationInput.addEventListener("gmp-select", onSelect);
    return () => locationInput.removeEventListener("gmp-select", onSelect);
  }, []);

  // Redirect to select-trip if logging in without making new trip
  useEffect(() => {
    if (loading) return;

    const wasLoggedOut = previousUserRef.current === null;
    const isNowLoggedIn = user !== null;

    if (wasLoggedOut && isNowLoggedIn) {
      // if any form values were edited
      if (formValues.tripName || formValues.location || formValues.startDate || formValues.endDate) {
        // don't redirect
      } else {
        router.push("/select-trip");
      }
    }

    previousUserRef.current = user;
  }, [user, loading, router]);

  // updates remaining form values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormErrMsg(null)
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let activeUser = user;

    // if not signed in, trigger OAuth popup first
    if (activeUser === null) {
      try {
        await signInWithGoogle();
        activeUser = auth.currentUser;
      } catch {
        setFormErrMsg(`Must be signed in to create a trip.`);
        return;
      }
    }

    if (activeUser === null) {
      setFormErrMsg(`Must be signed in to create a trip.`);
      return;
    }

    if (!formValues.startDate || !formValues.endDate) {
      setFormErrMsg(`Both start and end dates are required.`);
      return;
    }

    if (daysBetween(formValues.startDate, formValues.endDate) <= 0) {
      setFormErrMsg(`Start date must be before end date.`);
      return;
    }

    if (!formValues.location) {
      setFormErrMsg(`No place Destination yet.`);
      return;
    }

    // build users array: creator + invited users
    const allUsers = [activeUser.uid];

    // get location img
    let destImg: string | undefined;
    try {
      const place = new google.maps.places.Place({ id: formValues.location.locationId });
      await place.fetchFields({ fields: ["photos"] });
      if (place.photos && place.photos.length > 0) {
        destImg = place.photos[0].getURI({ maxWidth: 400 });
      }
    } catch (err) {
      console.error("Failed to fetch place details:", err);
      setFormErrMsg(`Failed to create trip. Please try again.`);
    }

    try {
      const tripId = await createTripForUsers(
        allUsers,
        formValues.tripName || `Trip to ${formValues.location.displayName}`,
        formValues.startDate,
        formValues.endDate,
        formValues.location,
        destImg,
      );

      router.push(`/trip/${tripId}`);
    } catch (err) {
      console.error("Failed to create trip:", err);
      setFormErrMsg(`Failed to create trip. Please try again.`);
    }
  }

  return (
    <>
      <Header />
      <div className="flex items-center justify-center h-full mt-23">
        <div className="flex-col items-center bg-white rounded-lg shadow-black/75 shadow-lg p-4 pb-15">
          <h2 className="text-center">Create a Trip</h2>
          <form className="flex flex-col gap-3 w-80 mt-7 create-trip-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="tripName" className="trip-form-label">
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
            </div>

            <div>
              <label>Destination</label>
              <gmp-place-autocomplete
                id="location"
                ref={locationInputRef}
                name="location"
                aria-label="Destination"
                {...({ placeholder: "E.g. New York" } as any)}
                className="border border-gray-400 rounded-md"
              ></gmp-place-autocomplete>
            </div>

            <div id="dates" className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label htmlFor="startDate" className="trip-form-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  onChange={handleChange}
                  className="trip-form-input w-full"
                ></input>
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="endDate" className="trip-form-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  onChange={handleChange}
                  className="trip-form-input w-full"
                ></input>
              </div>
            </div>

            <p className="text-red-600 text-left">{formErrorMsg}</p>

            <button className="trip-form-submit mt-5">Create Trip</button>
          </form>
        </div>
      </div>
    </>
  );
}
