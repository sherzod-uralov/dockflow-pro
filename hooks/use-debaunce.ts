import { useState, useEffect } from "react";

type UseDebounceReturn = [
  search: string,
  debouncedValue: string,
  setSearch: React.Dispatch<React.SetStateAction<string>>,
];

export function useDebounce(
  initialValue: string,
  delay: number = 500,
): UseDebounceReturn {
  const [search, setSearch] = useState<string>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(search);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, delay]);

  return [search, debouncedValue, setSearch];
}
