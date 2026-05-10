import clsx from "clsx";
import React from "react";

type Props = {
  selected: boolean;
};

const Payment = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="3"
        className={clsx(
          "dark:group-hover:fill-[#ffffff] transition-all dark:fill-[#353346] fill-[#d4d4d4] group-hover:fill-[#171717]",
          { "dark:!fill-[#ffffff] fill-[#0a72ef] ": selected }
        )}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 10H2V8H22V10Z"
        className={clsx(
          "dark:group-hover:fill-[#ffffff] transition-all dark:fill-[#C0BFC4] fill-[#666666] group-hover:fill-[#171717] ",
          { "dark:!fill-[#ffffff] fill-[#0a72ef] ": selected }
        )}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 15C4 14.4477 4.44772 14 5 14H11C11.5523 14 12 14.4477 12 15C12 15.5523 11.5523 16 11 16H5C4.44772 16 4 15.5523 4 15Z"
        className={clsx(
          "dark:group-hover:fill-[#ffffff] transition-all dark:fill-[#C0BFC4] fill-[#666666] group-hover:fill-[#171717] ",
          { "dark:!fill-[#ffffff] fill-[#0a72ef] ": selected }
        )}
      />
    </svg>
  );
};

export default Payment;
