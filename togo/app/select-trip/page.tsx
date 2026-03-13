"use client"
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserTrips, TripDocument } from "@/lib/db";
import { useRouter } from "next/navigation";
import TripCard from "@/components/select-trip-page/TripCard";

export default function SelectTrip() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trips, setTrips] = useState<TripDocument[] | null>(null);

  async function loadTrips(uid: string) {
    try {
      const trips: TripDocument[] = await getUserTrips(uid);

      // if no trips, redirect to create-trip page
      if (trips.length === 0) {
        router.replace("/create-trip");
        return;
      }

      setTrips(trips);
    
    } catch (err) {
      console.error(err);
      setError("Failed to load trip.");
    } finally {
      setLoading(false);
    }
  }

  // verify user is logged in, then load page
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    setLoading(true);
    setError(null);

    if (!user) {
      router.replace("/create-trip");
      return;
    }

    loadTrips(user.uid);
  }, [authLoading, user, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error ?? "Something went wrong."}
      </div>
    );
  }

  return (
    <>
      <div className="m-20 h-full w-6/10 mx-auto flex flex-col items-center">
        <div className="w-full">
          <div className="flex items-center justify-between w-full">
            <h1>Your Trips</h1>
            <a href="/create-trip" className="trip-form-submit">New Trip</a>
          </div>
          <div className="mt-2 grid grid-cols-[repeat(4,15rem)] justify-center gap-8">
            {
              trips?.map(trip => (
                <div key={trip.id} className="w-60 h-40">
                  <TripCard tripId={trip.id} tripName={trip.tripName} tripImgUrl={trip.locationImg} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}