import React, { memo } from "react";
import classnames from "classnames";

export enum ButtonPreset {
  Fill = "fill",
  Disabled = "disabled",
  Outlined = "outlined",
}

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  preset?: ButtonPreset;
};

function Button({ preset, children, onClick, className }: Props) {
  return (
    <button
      className={classnames(
        "transition py-3 px-12 rounded bg-yellow-400 hover:bg-opacity-90",
        {
          "cursor-not-allowed bg-gray-300 text-gray-800":
            preset === ButtonPreset.Disabled,
          "bg-white border border-yellow-400 text-yellow-700 hover:bg-yellow-400 hover:text-white":
            preset === ButtonPreset.Outlined,
        },

        className
      )}
      onClick={onClick}
      disabled={preset === ButtonPreset.Disabled}
    >
      {children}
    </button>
  );
}

export default memo(Button);
