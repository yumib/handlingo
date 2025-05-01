import { useRef, useState } from "react";

// Image Paths
const x_icon = "/assets/x-icon.png";
const pencil_icon = "/assets/pencil-edit-button.png";

interface UserInputFieldType {
  label: string;
  userDataValue: string;
  setValueChange: (val: string) => void;
  isPasswordField: boolean;
  isLocked: boolean;
}

const UserInputField = (props: UserInputFieldType) => {
  const inputRef = useRef<HTMLInputElement>(null); //name

  const handleUserClick = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (!props.setValueChange) return;

    props.setValueChange(e.target.value);
  };

  return (
    <>
      <div className="border border-black flex flex-col -mb-0 px-2">
        <label 
        htmlFor="password" 
        className="font-nunito text-xl font-semibold"
        >
          {props.label}
        </label>
        <div className="flex justify-between">
          <input // this is what's holding the actual content from the database and displaying it
            style = {{color: "#626367"}}
            className="mb-0 border border-transparent font-nunito font-light"
            ref={inputRef}
            // id="password"
            type={props.isPasswordField ? "password" : "text"}
            value={props.userDataValue}
            onChange={handleValueChange}
            disabled={props.isLocked}
          />
          <img
            src={props.isLocked ? x_icon : pencil_icon}
            alt="Edit"
            className="w-6 h-6 cursor-pointer"
            onClick={handleUserClick} //handle click to enable editing
          />
        </div>
      </div>
    </>
  );
};

export default UserInputField;
