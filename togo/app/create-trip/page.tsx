export default function CreateTrip() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex-col items-center text-center bg-white rounded-lg shadow-black/75 shadow-lg p-4 pb-15">
        <h1 className="text-2xl font-bold text-black mb-6">Create a Trip</h1>
        <br></br>
        <form className="flex flex-col gap-2 w-80">
          <label
            htmlFor="destination"
            className="text-black font-bold font-medium text-left"
          >
            Destination
          </label>
          <input
            type="text"
            id="destination"
            className="border border-gray-400 pl-2 mb-6 rounded-md"
            placeholder="Eg. Hawaii, or New York"
          ></input>
          <label
            htmlFor="dates"
            className="text-black font-bold font-medium text-left"
          >
            Dates
          </label>
          <div id="dates" className="flex">
            <input
              type="text"
              id="destination"
              placeholder="Start Date"
              className="border border-gray-400 pl-2 mr-1 rounded-md w-1/2"
            ></input>
            <input
              type="text"
              id="destination"
              placeholder="End"
              className="border border-gray-400 pl-2 ml-1 rounded-md w-1/2"
            ></input>
          </div>
          <button className="text-gray-600 text-sm text-left mb-10">
            + Invite Trip-Mates
          </button>

          <button className="bg-[#839F5D] text-white font-bold rounded-full pt-1 pb-1 pl-4 pr-4">
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
