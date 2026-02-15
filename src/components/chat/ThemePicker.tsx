import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { themes } from "../../lib/themes";
import { useTheme } from "../../hooks/useTheme";
import type { Mode } from "../../lib/themes";

const modes: { value: Mode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemePicker() {
  const { theme, mode, setTheme, setMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto p-3">
        <div className="grid grid-cols-5 gap-2 place-items-center">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className="relative h-6 w-6 rounded-full border border-border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: t.swatch }}
              title={t.label}
            >
              {theme === t.id && (
                <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
              )}
            </button>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="flex gap-1">
          {modes.map((m) => (
            <Button
              key={m.value}
              variant={mode === m.value ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => setMode(m.value)}
            >
              <m.icon className="h-3.5 w-3.5" />
              <span className="text-xs">{m.label}</span>
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
