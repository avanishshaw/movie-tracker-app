// src/components/Modal.jsx
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-black text-3xl leading-none font-semibold outline-none focus:outline-none">
            &times;
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;