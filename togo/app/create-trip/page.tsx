"use client";

import MapLocation from "@/types/MapLocation";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserByEmail } from "@/lib/db";
import { auth } from "@/lib/firebase";

type PlaceAutocompleteSelectEvent = Event & {
  placePrediction?: google.maps.places.PlacePrediction;
};

interface FormValues {
  tripName: string | null;
  location: MapLocation | null;
  startDate: string | null;
  endDate: string | null;
}

export default function CreateTrip() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const locationInputRef = useRef<google.maps.places.PlaceAutocompleteElement>(null);

  const [formValues, setFormValues] = useState<FormValues>({
    tripName: null,
    location: null,
    startDate: null,
    endDate: null,
  });

  // invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [invitedUids, setInvitedUids] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState("");

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

  async function handleInvite() {
    setInviteError("");
    const email = inviteEmail.trim().toLowerCase();

    if (!email) return;

    // check if already invited
    if (invitedEmails.includes(email)) {
      setInviteError("Already invited");
      return;
    }

    // check if it's the creator's own email
    if (user?.email?.toLowerCase() === email) {
      setInviteError("You're already part of this trip");
      return;
    }

    // look up the user in Firestore
    const uid = await getUserByEmail(email);
    if (!uid) {
      setInviteError("User not found — they need to sign up first");
      return;
    }

    setInvitedEmails((prev) => [...prev, email]);
    setInvitedUids((prev) => [...prev, uid]);
    setInviteEmail("");
  }

  function removeInvite(index: number) {
    setInvitedEmails((prev) => prev.filter((_, i) => i !== index));
    setInvitedUids((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let activeUser = user;

    // if not signed in, trigger OAuth popup first
    if (activeUser === null) {
      try {
        await signInWithGoogle();
        activeUser = auth.currentUser;
      } catch {
        alert("Sign-in is required to create a trip.");
        return;
      }
    }

    if (activeUser === null) {
      alert("Sign-in is required to create a trip.");
      return;
    }

    if (!formValues.location) {
      console.warn("No place selected yet");
      return;
    }

    // build users array: creator + invited users
    const allUsers = [activeUser.uid, ...invitedUids];

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formValues, users: allUsers }),
    });

    if (!res.ok) {
      alert(`${res.status}: ${res.statusText}`);
      return;
    }

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

          {/* invite trip-mates */}
          <div className="mt-2 text-left">
            <label className="trip-form-label text-gray-400">
              Invite Trip-Mates
            </label>
            <div className="flex gap-1 mt-1">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInvite();
                  }
                }}
                className="trip-form-input w-full"
              />
              <button
                type="button"
                onClick={handleInvite}
                className="text-sm px-3 py-1 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            {inviteError && (
              <p className="text-red-500 text-xs text-left mt-1">{inviteError}</p>
            )}
            {invitedEmails.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {invitedEmails.map((email, i) => (
                  <span
                    key={email}
                    className="text-xs bg-gray-100 border border-gray-300 rounded-full px-3 py-1 flex items-center gap-1"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeInvite(i)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <br/>
          <button className="trip-form-submit">Create Trip</button>
        </form>
      </div>
    </div>
  );
}
