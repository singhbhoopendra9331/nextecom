"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export const AppProgressbar = () => {
  return (
    <ProgressBar
      height="4px"
      color="#fffd00"
      options={{ showSpinner: true }}
      shallowRouting
    />
  );
};
