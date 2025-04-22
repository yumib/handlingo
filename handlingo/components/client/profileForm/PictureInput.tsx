import { useRef } from "react";

interface ProfilePicType {
  picUrl: string;
  handlePicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const default_profile_img = "/assets/default-profile-pic.png";
const pencil_icon = "/assets/default-profile-pencil-icon.png";

const PictureInputField = (props: ProfilePicType) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {" "}
        {/* Display the current profile picture */}
        {props.picUrl ? (
          <img
            src={props.picUrl}
            alt="Profile Picture"
            className="w-32 h-32 rounded-full object-cover border border-gray-400"
          />
        ) : (
          <img
            src={default_profile_img}
            alt="Profile Picture"
            className="w-44 h-44 rounded-full object-cover"
          />
        )}
        {/* File input for new profile picture */}
        <button type="button">
          <img
            src={pencil_icon}
            alt="Profile Picture"
            className="w-8 h-8 rounded-full object-cover -translate-y-14 translate-x-12"
            onClick={handleEditClick}
          />
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={props.handlePicChange}
          className="text-sm hidden"
          ref={inputRef}
        />
      </div>
    </>
  );
};

export default PictureInputField;
