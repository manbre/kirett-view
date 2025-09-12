//
// types for term payloads used by the term endpoints and UI lists
export type TermItem = {
  value: string;
  label: string;
};

export type GroupedTermItem = {
  value: string;
  label: string;
  group: string;
};
