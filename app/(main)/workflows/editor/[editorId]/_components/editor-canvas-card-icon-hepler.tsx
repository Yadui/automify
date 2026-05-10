"use client";
import React from "react";
import { EditorCanvasTypes } from "@/lib/types";
import ConnectorLogo from "@/components/global/connector-logo";

type Props = { type: EditorCanvasTypes };

const EditorCanvasIconHelper = ({ type }: Props) => {
  return <ConnectorLogo type={type} />;
};

export default EditorCanvasIconHelper;
