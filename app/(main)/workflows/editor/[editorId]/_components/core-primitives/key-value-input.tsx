import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

type KeyValue = {
  key: string;
  value: string;
};

type Props = {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  title?: string;
};

const KeyValueInput = ({ items, onChange, title = "Headers" }: Props) => {
  const handleAdd = () => {
    onChange([...items, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Key"
              value={item.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
            No {title.toLowerCase()} added
          </p>
        )}
      </div>
    </div>
  );
};

export default KeyValueInput;
