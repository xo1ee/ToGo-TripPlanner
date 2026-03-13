"use client";

import {
  ItineraryItemProps
} from "@/components/trip-page/ItineraryItem";
import { ItineraryDayProps } from "@/components/trip-page/ItineraryDay";
import Trip from "@/components/trip-page/Trip";
import { useEffect, useState } from "react";
import { getTrip, getTripActivities } from "@/lib/db";
import MapLocation from "@/types/MapLocation";
import { useAuth } from "@/context/AuthContext";

interface TripPageProps {
  tripIdFromParams: string;
}

export interface TripProps {
  userids: string[]; // users who can access trip
  tripName: string;
  startDate: Date;
  endDate: Date;
  location: MapLocation;
}

export default function TripPage({ tripIdFromParams }: TripPageProps) {
  const tripId = tripIdFromParams;
  const { user, loading: authLoading } = useAuth();

  const [tripInfo, setTripInfo] = useState<TripProps | null>(null);
  const [wishlist, setWishlist] = useState<ItineraryItemProps[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDayProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);

    if (!tripId) {
      setError("No trip ID provided. Use /trip/<tripId>.");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("You must be signed in to view this trip.");
      setLoading(false);
      return;
    }

    const currentUser = user;

    async function loadTrip() {
      try {
        const trip = await getTrip(tripId as string);
        if (!trip) {
          setError("Trip not found.");
          setLoading(false);
          return;
        }

        if (!trip.users.includes(currentUser.uid)) {
          setError("You do not have access to this trip.");
          setLoading(false);
          return;
        }

        const { wishlist: wl, itinerary: it } = await getTripActivities(
          tripId as string,
          trip.startDate,
          trip.endDate
        );

        setTripInfo({
          userids: trip.users,
          tripName: trip.tripName,
          startDate: trip.startDate,
          endDate: trip.endDate,
          location: trip.location,
        });
        setWishlist(wl);
        setItinerary(it);
      } catch (err) {
        console.error(err);
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [tripId, authLoading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading trip...
      </div>
    );
  }

  if (error || !tripInfo) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  return (
    <Trip
      tripInfo={tripInfo}
      wishlist={wishlist}
      itinerary={itinerary}
      tripId={tripId as string}
    />
  );
}
