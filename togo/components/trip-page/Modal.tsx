export interface ModalProps {
  hidden: boolean;
  onClose: () => void;
  children: React.ReactNode | null;
}

export default function Modal({ hidden, onClose, children }: ModalProps) {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      onClose();
    }
  });
  return (
    <div
      hidden={hidden}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
      onClick={onClose}
    >
      <div
        className="relative w-11/12 max-w-2xl min-h-80 rounded-xl bg-gray-50 p-6 shadow-2xl border"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black"
          aria-label="Close modal"
        >
          x
        </button>
        {children}
      </div>
    </div>
  );
}
