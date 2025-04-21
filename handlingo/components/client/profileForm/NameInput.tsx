import { useState, useRef } from "react";

const pencil_icon = "/assets/pencil-edit-button.png";

// TODO: FIX EDIT BOOLEAN STATE ON BLUR WHEN INPUT VALUE IS EMPTY

type FullNameInputType = {
  firstName: string;
  lastName: string;
  fullName: string;
  setFullName: (val: string) => void;
  onSubmit: (val: string) => void;
};

const NameInputField = (props: FullNameInputType) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState(false); // current state when user hasn't pressed button
  const inputRef = useRef<HTMLInputElement>(null); //name

  const handleIsEditing = () => {
    setIsEditing(!isEditing);
    setIsEditable(true); // enable editing when the pencil is clicked
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const capitalize = (name: string) =>
    name.length > 0 ? name[0].toUpperCase() + name.slice(1) : "";

  const handleSubmit = () => {
    if (props.fullName.trim().length === 0) return;
    props.onSubmit(props.fullName.trim());
    setIsEditing(false);
    setIsEditable(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setFullName(e.target.value);
  };
  // const [name, setName] = useState<string>("");
  const pastName = `${capitalize(props.firstName)} ${capitalize(props.lastName)}`;

  return (
    <div className="flex w-1/3 justify-center self-center gap-4 mb-12">
      {!isEditing ? (
        <div className="flex gap-1">
          <p>{capitalize(props.firstName)}</p>
          <p>{capitalize(props.lastName)}</p>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="text"
            className="mb-0 border border-transparent font-nunito font-light border-cyan-600 px-3 rounded-xl"
            placeholder={pastName}
            value={props.fullName}
            onChange={handleNameChange}
            disabled={!isEditable} //if not editable, the input is disabled
            onBlur={handleSubmit}
            name="fullName"
          />
        </>
      )}

      <img
        src={pencil_icon}
        alt="clickable icon for editing user's firs and last name"
        className="w-6 h-6 cursor-pointer"
        onClick={handleIsEditing}
      />
    </div>
  );
};

export default NameInputField;
