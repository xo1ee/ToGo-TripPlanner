import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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
  index: number; // order within the day
}

/* Returns the number of days between two dates (inclusive) */
function daysBetween(start: Date, end: Date): number {
  const startMs = new Date(start).setUTCHours(0, 0, 0, 0);
  const endMs = new Date(end).setUTCHours(0, 0, 0, 0);
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Users ─────────────────

/* Create or update user document on sign-in.
   Uses setDoc with merge so it doesn't overwrite existing data. */
export async function saveUser(uid: string, name: string, email: string, photoURL: string) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    photoURL,
  }, { merge: true });
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

/* Fetch all trips that a user is part of (checks the users array on each trip) */
export async function getUserTrips(userId: string): Promise<TripDocument[]> {
  const q = query(
    collection(db, "trips"),
    where("users", "array-contains", userId),
  );
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
  endDate: Date,
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
        index: a.index,
        itemName: a.itemName,
        itemDesc: a.itemDesc,
        itemNote: a.itemNote,
        destImg: a.destImg,
        location: a.location,
        firestoreId: a.id,
      });
    });

  // to find the # of days between startDate and endDate so we can generate all of them 
  const totalDays = daysBetween(startDate, endDate);
  const itinerary: ItineraryDayProps[] = Array.from(
    { length: totalDays },
    (_, dayIndex) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + dayIndex);
      return { date, dayIndex, items: dayMap.get(dayIndex) || [] };
    },
  );

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
