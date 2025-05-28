export type FormInputInterface<T> = {
  shape:
    | "number"
    | "string"
    | "textarea"
    | "boolean"
    | "select"
    | "multiple-select"
    | "tag-input"
    | "custom"
    | "switch"
    | "checkbox"
    | "input"
    | "drag-upload"
    | "image-upload"
    | "upload"
    | "date-picker"
    | "list"
    | "form"
    | "drag-select";
  // state: any;
  value: T;
  defaultValue: T;
  setValue: (v: T, extra?: Partial<{ silence: boolean }>) => void;
  destroy?: () => void;
  onChange: (fn: (v: T) => void) => void;
  // onStateChange: (fn: (v: any) => void) => void;
};
