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
import { ItineraryItemProps, MapLocation } from "@/components/trip-page/ItineraryItem";
import { ItineraryDayProps } from "@/components/trip-page/ItineraryDay";
import { TripProps } from "@/app/trip/page";

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
  day: string | null; // null if wishlist
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
  location: MapLocation
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

/* Fetch all activities for a trip & return them in either itinerary or wishlist */
export async function getTripActivities(tripId: string): Promise<{
  wishlist: ItineraryItemProps[];
  itinerary: ItineraryDayProps[];
}> {
  const q = query(
    collection(db, "trips", tripId, "activities"),
    orderBy("index")
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

  // Group itinerary activities by day
  const dayMap = new Map<string, ItineraryItemProps[]>();
  activities
    .filter((a) => !a.isWishlist && a.day)
    .forEach((a, i) => {
      const day = a.day as string;
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push({
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

  const itinerary: ItineraryDayProps[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({
      date: new Date(day),
      items,
    }));

  return { wishlist, itinerary };
}

/* Add an activity to a trip */
export async function addActivity(
  tripId: string,
  activity: Omit<ActivityDocument, "id" | "tripId">
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
  note: string
): Promise<void> {
  await updateDoc(doc(db, "trips", tripId, "activities", firestoreId), {
    itemNote: note,
  });
}

/* Update an activity's day and index (after drag-and-drop) */
export async function moveActivity(
  tripId: string,
  firestoreId: string,
  day: string | null,
  isWishlist: boolean,
  index: number
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
  firestoreId: string
): Promise<void> {
  await deleteDoc(doc(db, "trips", tripId, "activities", firestoreId));
}
