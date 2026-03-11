import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { ItineraryItemProps } from "@/components/trip-page/ItineraryItem";
import { ItineraryDayProps } from "@/components/trip-page/ItineraryDay";
import { TripProps } from "@/app/trip/page";
import MapLocation from "@/types/MapLocation";

// ─── Types ──────────────

export interface TripDocument {
  id: string;
  userId: string;
  tripName: string;
  startDate: Date;
  endDate: Date;
  location: MapLocation;
}

export interface ActivityDocument {
  id: string;
  tripId: string;
  itemName: string;
  itemDesc: string;
  itemNote?: string;
  destImg?: string;
  location?: MapLocation;
  isWishlist: boolean;
  day: number | null; // null if wishlist
  index: number;
}

// ─── Trips ─────────────────

/* Fetch a single trip by ID */
export async function getTrip(tripId: string): Promise<TripDocument | null> {
  const snap = await getDoc(doc(db, "trips", tripId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    userId: data.userId,
    tripName: data.tripName,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    location: data.location,
  };
}

/* Fetch all trips belonging to a user */
export async function getUserTrips(userId: string): Promise<TripDocument[]> {
  const q = query(collection(db, "trips"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      tripName: data.tripName,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      location: data.location,
    };
  });
}

/* Create a new trip */
export async function createTrip(
  userId: string,
  tripName: string,
  startDate: Date,
  endDate: Date,
  location: MapLocation,
): Promise<string> {
  const ref = await addDoc(collection(db, "trips"), {
    userId,
    tripName,
    startDate,
    endDate,
    location,
  });
  return ref.id;
}

// ─── Activities ─────────────

/* Fetch all activities for a trip & return them in either itinerary or wishlist.
   startDate is needed here to convert day indexes back into actual dates. */
export async function getTripActivities(
  tripId: string,
  startDate: Date,
): Promise<{
  wishlist: ItineraryItemProps[];
  itinerary: ItineraryDayProps[];
}> {
  const q = query(
    collection(db, "trips", tripId, "activities"),
    orderBy("index"),
  );
  const snap = await getDocs(q);

  const activities: ActivityDocument[] = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ActivityDocument, "id">),
  }));

  // Split into wishlist and itinerary items
  const wishlist: ItineraryItemProps[] = activities
    .filter((a) => a.isWishlist)
    .map((a, i) => ({
      id: i,
      index: a.index,
      itemName: a.itemName,
      itemDesc: a.itemDesc,
      itemNote: a.itemNote,
      destImg: a.destImg,
      location: a.location,
      wishlistItem: true,
      firestoreId: a.id,
    }));

  // Group itinerary activities by day index
  const dayMap = new Map<number, ItineraryItemProps[]>();
  activities
    .filter((a) => !a.isWishlist && a.day !== null)
    .forEach((a, i) => {
      const dayIndex = a.day as number;
      if (!dayMap.has(dayIndex)) dayMap.set(dayIndex, []);
      dayMap.get(dayIndex)!.push({
        id: i,
        index: a.index,
        itemName: a.itemName,
        itemDesc: a.itemDesc,
        itemNote: a.itemNote,
        destImg: a.destImg,
        location: a.location,
        firestoreId: a.id,
      });
    });

  // Convert day indexes to actual dates (startDate + N days)
  const itinerary: ItineraryDayProps[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayIndex, items]) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + dayIndex);
      return { date, items };
    });

  return { wishlist, itinerary };
}

/* Add an activity to a trip */
export async function addActivity(
  tripId: string,
  activity: Omit<ActivityDocument, "id" | "tripId">,
): Promise<string> {
  const ref = await addDoc(collection(db, "trips", tripId, "activities"), {
    ...activity,
    tripId,
  });
  return ref.id;
}

/* Update an activity's note */
export async function updateActivityNote(
  tripId: string,
  firestoreId: string,
  note: string,
): Promise<void> {
  await updateDoc(doc(db, "trips", tripId, "activities", firestoreId), {
    itemNote: note,
  });
}

/* Update an activity's day and index (after drag-and-drop) */
export async function moveActivity(
  tripId: string,
  firestoreId: string,
  day: number | null,
  isWishlist: boolean,
  index: number,
): Promise<void> {
  await updateDoc(doc(db, "trips", tripId, "activities", firestoreId), {
    day,
    isWishlist,
    index,
  });
}

/* Delete an activity */
export async function deleteActivity(
  tripId: string,
  firestoreId: string,
): Promise<void> {
  await deleteDoc(doc(db, "trips", tripId, "activities", firestoreId));
}
