import { ConnectionProviderProps } from "@/providers/connection-provider";
import { EditorState } from "@/providers/editor-provider";
import { EditorNodeMetadata } from "@/lib/types";
import { useFuzzieStore } from "@/store";
import React from "react";
import ContentBasedOnTitle from "./content-based-on-title";

type Props = {
  state: EditorState;
  nodeConnection: ConnectionProviderProps;
  onUpdateNodeMetadata: (nodeId: string, metadata: Partial<EditorNodeMetadata>) => void;
};

const RenderOutputAccordion = ({ state, nodeConnection, onUpdateNodeMetadata }: Props) => {
  const {
    selectedSlackChannels,
    setSelectedSlackChannels,
  } = useFuzzieStore();
  return (
    <ContentBasedOnTitle
      nodeConnection={nodeConnection}
      newState={state}
      selectedSlackChannels={selectedSlackChannels}
      setSelectedSlackChannels={setSelectedSlackChannels}
      googleIsListening={false}
      onUpdateNodeMetadata={onUpdateNodeMetadata}
    />
  );
};

export default RenderOutputAccordion;
