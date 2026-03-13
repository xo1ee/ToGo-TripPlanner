import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  Timestamp,
  collection,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
const TRIPS_COLLECTION = "trips";

export async function POST(req: NextRequest) {
  try {
    const formValues = await req.json();

    // TODO: add value validation

    // parse request body
    const { tripName, location, startDate, endDate, users } = formValues;

    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), {
      tripName,
      location,
      startDate: startDate
        ? Timestamp.fromDate(new Date(`${startDate}T00:00:00Z`))
        : null,
      endDate: endDate
        ? Timestamp.fromDate(new Date(`${endDate}T00:00:00Z`))
        : null,
      users,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { tripId: docRef.id, message: "Post created" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    console.log("in patch");
    const formValues = await req.json();
    const { id, tripName } = formValues;

    console.log("in patch--id: " + id + " " + tripName);

    const docRef = doc(db, "trips", id);
    await updateDoc(docRef, formValues);

    return NextResponse.json(
      { tripId: docRef.id, message: "Trip name editted" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create patch" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  //   return NextResponse.json({ trips }, { status: 200 });
}
