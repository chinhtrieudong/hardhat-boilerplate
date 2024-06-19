import classNames from "classnames";
import Link from "next/link";
import React from "react";
import { TiTick } from "react-icons/ti";

type Props = {
  imageUrl: string;
  url?: string;
  name: string;
  price?: number;
  ethPrice?: number;
  isSold?: boolean;
};

function Card({ imageUrl, url, name, price, ethPrice, isSold }: Props) {
  return (
    <Link href={url || ""}>
      <div className="rounded-md shadow-md border transform transition duration-300 hover:-translate-y-1 relative">
        <img src={imageUrl} className="w-full aspect-square" />

        <div className="flex flex-col space-y-1 p-2">
          <div className="text-lg font-bold flex items-center justify-between">
            {name}

            {isSold && (
              <p className="bg-green-500 text-white rounded-md px-2 py-1 text-sm font-bold inline-block ml-2">
                <TiTick className="inline-block mr-1" />
                Sold
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <span className="flex gap-1 items-center text-xs font-semibold text-yellow-600">
              WIN NFT HEROES
              <span className="text-green-500">
                <TiTick />
              </span>
            </span>

            <span className="rounded bg-gray-200 text-gray-700 p-1">BSC</span>
          </div>

          {price && ethPrice && (
            <div className="flex justify-between">
              <span>Price</span>

              <div>
                <span className="flex gap-1 items-center justify-end">
                  <img
                    src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png"
                    alt=""
                    className="w-5 h-5"
                  />

                  <span className="font-semibold">
                    {Intl.NumberFormat("en-US", {}).format(price)} BNB
                  </span>
                </span>
                <span className="text-right block text-sm text-gray-500">
                  ≈ $ {(price * ethPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Card;
