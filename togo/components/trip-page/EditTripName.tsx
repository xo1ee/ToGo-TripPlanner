export interface AddItemProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export interface AddItemFormSubmitData {
  addedToContainerIds: string[];
}

export default function AddItem(props: AddItemProps) {
  return (
    <div>
      <h3 className="mb-2 text-center">Edit Trip Name</h3>
      <form onSubmit={props.handleSubmit}>
        <label htmlFor="name">New Trip Name</label>

        <input
          name="name"
          id="name"
          type="text"
          placeholder="Trip Name"
          className="mr-1 w-full"
        ></input>

        <div className="flex justify-center">
          <button type="submit" className="trip-form-submit w-8/10">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
