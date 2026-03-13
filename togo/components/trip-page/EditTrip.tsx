import { useMemo, useState } from "react";

export interface EditTripUpdates {
  tripName?: string;
  startDate?: Date;
  endDate?: Date;
}

interface EditTripProps {
	tripName: string;
	startDate: Date;
	endDate: Date;
	getAffectedCount: (newStart: Date, newEnd: Date) => number;
	onSave: (updates: EditTripUpdates) => Promise<void>;
}

function toDateString(date: Date): string {
	return date.toISOString().split("T")[0];
}

export default function EditTrip({
	tripName,
	startDate,
	endDate,
	getAffectedCount,
	onSave,
}: EditTripProps) {
	const [newTripName, setNewTripName] = useState(tripName);
	const [newStart, setNewStart] = useState(toDateString(startDate));
	const [newEnd, setNewEnd] = useState(toDateString(endDate));
	const [error, setError] = useState("");

	const nextStartDate = useMemo(
		() => new Date(`${newStart}T00:00:00Z`),
		[newStart],
	);
	const nextEndDate = useMemo(
		() => new Date(`${newEnd}T00:00:00Z`),
		[newEnd],
	);
	const affectedCount = useMemo(
		() => getAffectedCount(nextStartDate, nextEndDate),
		[getAffectedCount, nextStartDate, nextEndDate],
	);

	async function handleSave(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		const trimmedName = newTripName.trim();
		if (!trimmedName) {
			setError("Trip name cannot be empty");
			return;
		}

		if (!newStart || !newEnd) {
			setError("Both dates are required");
			return;
		}

		if (newEnd < newStart) {
			setError("End date can't be before start date");
			return;
		}

		const updates: EditTripUpdates = {};

		if (trimmedName !== tripName) {
			updates.tripName = trimmedName;
		}

		if (
			nextStartDate.getTime() !== startDate.getTime() ||
			nextEndDate.getTime() !== endDate.getTime()
		) {
			updates.startDate = nextStartDate;
			updates.endDate = nextEndDate;
		}

		if (!updates.tripName && !updates.startDate) {
			setError("No changes to save");
			return;
		}

		await onSave(updates);
	}

	return (
		<div>
			<h3 className="mb-2 text-center">Edit Trip</h3>
			<form onSubmit={handleSave}>
				<div className="mb-4">
					<label htmlFor="editTripName">Trip Name</label>
					<input
						id="editTripName"
						type="text"
						value={newTripName}
						onChange={(e) => setNewTripName(e.target.value)}
						className="w-full"
					/>
				</div>

				<div className="flex gap-4 mb-4">
					<div className="flex-1">
						<label htmlFor="editStartDate">Start Date</label>
						<input
							type="date"
							id="editStartDate"
							value={newStart}
							onChange={(e) => setNewStart(e.target.value)}
							className="w-full"
						/>
					</div>
					<div className="flex-1">
						<label htmlFor="editEndDate">End Date</label>
						<input
							type="date"
							id="editEndDate"
							value={newEnd}
							onChange={(e) => setNewEnd(e.target.value)}
							className="w-full"
						/>
					</div>
				</div>

				{error && <p className="text-red-500 text-sm mb-2">{error}</p>}

				{affectedCount > 0 && (
					<p className="text-amber-600 text-sm mb-2">
						{affectedCount} {affectedCount === 1 ? "activity" : "activities"} will be moved to the wishlist
					</p>
				)}

				<div className="flex justify-center">
					<button type="submit" className="trip-form-submit m-5 w-8/10">
						Save
					</button>
				</div>
			</form>
		</div>
	);
}
