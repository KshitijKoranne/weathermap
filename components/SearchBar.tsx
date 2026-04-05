"use client";
import { useState, useEffect, useRef } from "react";
import { Theme, City } from "@/lib/types";

interface Suggestion {
  name: string;
  lat: number;
  lon: number;
}

interface Props {
  theme: Theme;
  onSelect: (city: City) => void;
  initialValue?: string;
}

export default function SearchBar({ theme, onSelect, initialValue = "" }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(initialValue); }, [initialValue]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.map((d: any) => ({
          name: d.display_name.split(",").slice(0, 3).join(","),
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
        })));
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 320);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const s = suggestions[0];
      setQuery(s.name.split(",")[0]);
      setOpen(false);
      onSelect({ name: s.name.split(",")[0], lat: s.lat, lon: s.lon });
    }
  };

  const pick = (s: Suggestion) => {
    setQuery(s.name.split(",")[0]);
    setOpen(false);
    onSelect({ name: s.name.split(",")[0], lat: s.lat, lon: s.lon });
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: `${theme.bg}cc`,
          border: `1px solid ${theme.sub}44`,
          backdropFilter: "blur(14px)",
          padding: "11px 16px",
          transition: "border-color 0.3s",
        }}>
          <span style={{ color: theme.sub, fontSize: 12, flexShrink: 0 }}>◎</span>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="SEARCH CITY"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: theme.text, fontFamily: "'DM Mono', monospace",
              fontSize: 12, letterSpacing: 3,
            }}
          />
          <button type="submit" style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: theme.accent, fontSize: 16, padding: 0, lineHeight: 1,
            flexShrink: 0,
          }}>→</button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: `${theme.bg}f0`,
          border: `1px solid ${theme.sub}33`,
          borderTop: "none",
          backdropFilter: "blur(14px)",
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => pick(s)}
              style={{
                padding: "9px 16px", cursor: "pointer",
                color: theme.sub, fontSize: 11, letterSpacing: 1,
                borderBottom: i < suggestions.length - 1 ? `1px solid ${theme.sub}1a` : "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.color = theme.text;
                (e.currentTarget as HTMLDivElement).style.background = `${theme.sub}11`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.color = theme.sub;
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
