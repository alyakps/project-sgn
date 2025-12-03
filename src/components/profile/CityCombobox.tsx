"use client";

import * as React from "react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth-storage";

type City = {
  id: number;
  name: string;
};

export function CityCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [cities, setCities] = React.useState<City[]>([]);

  const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
      .replace(/\/$/, "") + "/api";

  async function loadCities(keyword: string) {
    try {
      setLoading(true);

      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/master/cities?search=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      setCities(json.data || []);
    } catch (err) {
      console.error("Failed to load cities:", err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    // load awal tanpa keyword
    loadCities("");
  }, []);

  React.useEffect(() => {
    const delay = setTimeout(() => {
      loadCities(search);
    }, 350);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between text-left h-8 text-sm",
            !value && "text-muted-foreground"
          )}
        >
          {value || "Pilih Kota / Kabupaten"}
          <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[260px]">
        <Command>
          <CommandInput
            placeholder="Cari kota..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Memuat...
              </div>
            ) : (
              <>
                {!cities.length && (
                  <CommandEmpty>Tidak ada hasil.</CommandEmpty>
                )}

                {cities.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.name}
                    onSelect={() => {
                      onChange(c.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === c.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {c.name}
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
