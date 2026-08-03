import { ClipLoader } from "react-spinners";

const Spinner = ({
  size = 50,
  color = "#2563eb",
  fullScreen = true,
  text = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "h-screen" : "py-10"
      }`}
    >
      <ClipLoader color={color} size={size} />
      {text && (
        <p className="mt-4 text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Spinner;
