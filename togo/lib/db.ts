import {
  Timestamp,
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
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { ItineraryItemProps } from "@/components/trip-page/ItineraryItem";
import { ItineraryDayProps } from "@/components/trip-page/ItineraryDay";
import MapLocation from "@/types/MapLocation";

// ─── Types ──────────────

export interface TripDocument {
  id: string;
  users: string[];
  tripName: string;
  startDate: Date;
  endDate: Date;
  location: MapLocation;
  locationImg?: string;
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
export function daysBetween(start: Date, end: Date): number {
  const startMs = new Date(start).setUTCHours(0, 0, 0, 0);
  const endMs = new Date(end).setUTCHours(0, 0, 0, 0);
  return Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Users ─────────────────

/* Create or update user document on sign-in.
   Uses setDoc with merge so it doesn't overwrite existing data. */
export async function saveUser(uid: string, name: string, email: string, photoURL: string) {
  try {
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      photoURL,
    }, { merge: true });
  } catch (error) {
    console.error("Failed to save user document:", error);
    throw error;
  }
}

/* Look up a user by their email. Returns their UID or null if not found. */
export async function getUserByEmail(email: string): Promise<string | null> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id; // doc ID is the user's UID
  } catch (error) {
    console.error("Failed to get user by email:", error);
    throw error;
  }
}

// ─── Trips ─────────────────

/* Fetch a single trip by ID */
export async function getTrip(tripId: string): Promise<TripDocument | null> {
  try {
    const snap = await getDoc(doc(db, "trips", tripId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      users: data.users,
      tripName: data.tripName,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      location: data.location,
      locationImg: data.locationImg
    };
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    throw error;
  }
}

/* Fetch all trips that a user is part of (checks the users array on each trip) */
export async function getUserTrips(userId: string): Promise<TripDocument[]> {
  try {
    const q = query(
      collection(db, "trips"),
      where("users", "array-contains", userId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        users: data.users,
        tripName: data.tripName,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        location: data.location,
        locationImg: data.locationImg
      };
    });
  } catch (error) {
    console.error("Failed to fetch user trips:", error);
    throw error;
  }
}

/* Create a new trip document for one or more users.
   Dates are normalized to midnight UTC for stable day math. */
export async function createTripForUsers(
  users: string[],
  tripName: string,
  startDate: string | Date,
  endDate: string | Date,
  location: MapLocation,
  locationImg?: string,
): Promise<string> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const ref = await addDoc(collection(db, "trips"), {
      users,
      tripName,
      startDate: Timestamp.fromDate(
        new Date(`${start.toISOString().slice(0, 10)}T00:00:00Z`),
      ),
      endDate: Timestamp.fromDate(
        new Date(`${end.toISOString().slice(0, 10)}T00:00:00Z`),
      ),
      location,
      locationImg,
      createdAt: new Date(),
    });

    return ref.id;
  } catch (error) {
    console.error("Failed to create trip for users:", error);
    throw error;
  }
}

/* Update a trip's display name */
export async function updateTripName(
  tripId: string,
  tripName: string,
): Promise<void> {
  try {
    await updateDoc(doc(db, "trips", tripId), { tripName });
  } catch (error) {
    console.error("Failed to update trip name:", error);
    throw error;
  }
}

/* Update a trip's dates. Handles shifting activity day indexes and
   moving orphaned activities (on days that no longer exist) to the wishlist. */
export async function updateTripDates(
  tripId: string,
  oldStart: Date,
  newStart: Date,
  newEnd: Date,
): Promise<void> {
  try {
    const oldStartMs = new Date(oldStart).setUTCHours(0, 0, 0, 0);
    const newStartMs = new Date(newStart).setUTCHours(0, 0, 0, 0);
    const dayShift = Math.round((oldStartMs - newStartMs) / (1000 * 60 * 60 * 24));
    const newTotalDays = daysBetween(newStart, newEnd);

    // update trip document
    await updateDoc(doc(db, "trips", tripId), { startDate: newStart, endDate: newEnd });

    // fetch all non-wishlist activities
    const q = query(
      collection(db, "trips", tripId, "activities"),
      where("isWishlist", "==", false),
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);

    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.day === null) return;

      const newDay = data.day + dayShift;

      // if the new day is out of range, move to wishlist
      if (newDay < 0 || newDay >= newTotalDays) {
        batch.update(d.ref, { day: null, isWishlist: true });
      } else if (dayShift !== 0) {
        batch.update(d.ref, { day: newDay });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to update trip dates:", error);
    throw error;
  }
}

/* Deletes a trip and all associated activities with it. */
export async function deleteTrip(
  tripId: string
): Promise<void> {
  try {
    const activitiesRef = collection(db, "trips", tripId, "activities");
    const activitiesSnap = await getDocs(activitiesRef);

    // Firestore batches support up to 500 operations.
    const activityDocs = activitiesSnap.docs;
    for (let i = 0; i < activityDocs.length; i += 500) {
      const batch = writeBatch(db);
      activityDocs.slice(i, i + 500).forEach((activityDoc) => {
        batch.delete(activityDoc.ref);
      });
      await batch.commit();
    }

    await deleteDoc(doc(db, "trips", tripId));
  } catch (error) {
    console.error("Failed to delete trip:", error);
    throw error;
  }
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
  try {
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
      .forEach((a) => {
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
        date.setUTCHours(0, 0, 0, 0);
        return { date, dayIndex, items: dayMap.get(dayIndex) || [] };
      },
    );

    return { wishlist, itinerary };
  } catch (error) {
    console.error("Failed to fetch trip activities:", error);
    throw error;
  }
}

/* Add an activity to a trip */
export async function addActivity(
  tripId: string,
  activity: Omit<ActivityDocument, "id" | "tripId">,
): Promise<string> {
  try {
    const ref = await addDoc(collection(db, "trips", tripId, "activities"), {
      ...activity,
      tripId,
    });
    return ref.id;
  } catch (error) {
    console.error("Failed to add activity:", error);
    throw error;
  }
}

/* Update an activity's note */
export async function updateActivityNote(
  tripId: string,
  firestoreId: string,
  note: string,
): Promise<void> {
  try {
    await updateDoc(doc(db, "trips", tripId, "activities", firestoreId), {
      itemNote: note,
    });
  } catch (error) {
    console.error("Failed to update activity note:", error);
    throw error;
  }
}

/* Update an activity's day and index (after drag-and-drop) */
export async function moveActivity(
  tripId: string,
  firestoreId: string,
  day: number | null,
  isWishlist: boolean,
  index: number,
): Promise<void> {
  try {
    await updateDoc(doc(db, "trips", tripId, "activities", firestoreId), {
      day,
      isWishlist,
      index,
    });
  } catch (error) {
    console.error("Failed to move activity:", error);
    throw error;
  }
}

/* Delete an activity */
export async function deleteActivity(
  tripId: string,
  firestoreId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, "trips", tripId, "activities", firestoreId));
  } catch (error) {
    console.error("Failed to delete activity:", error);
    throw error;
  }
}
