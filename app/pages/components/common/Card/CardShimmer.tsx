import React from "react";
import { TiTick } from "react-icons/ti";

type Props = {};

function Card() {
  return (
    <div className="rounded-md shadow-md border transform transition duration-300 hover:-translate-y-1">
      <div className="w-full aspect-square animate-pulse bg-gray-300"></div>

      <div className="flex flex-col space-y-1 p-2">
        <div className="text-lg font-bold animate-pulse bg-gray-300 h-4"></div>

        <div className="flex justify-between">
          <span className="flex gap-1 items-center text-xs font-semibold text-yellow-600 h-5 bg-gray-300 animate-pulse w-20"></span>

          <span className="rounded bg-gray-200 text-gray-700 p-1 h-5 animate-pulse w-10"></span>
        </div>

        <div className="flex justify-between">
          <div className="w-10 h-5 bg-gray-300 animate-pulse"></div>

          <div>
            <span className="flex gap-1 items-center">
              <div className="w-10 h-5 bg-gray-300 animate-pulse"></div>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
