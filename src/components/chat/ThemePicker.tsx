import { Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { codeThemes } from "../../lib/themes";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ThemePicker() {
	const { codeTheme, setCodeTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const [swatchesLoaded, setSwatchesLoaded] = useState(false);
	const [swatchesByTheme, setSwatchesByTheme] = useState<
		Record<string, string[]>
	>({});

	useEffect(() => {
		if (!open || swatchesLoaded) return;

		let cancelled = false;
		import("../../lib/shiki-themes")
			.then(async ({ getShikiThemeSwatches }) => {
				const entries = await Promise.all(
					codeThemes.map(async (themeOption) => [
						themeOption.id,
						await getShikiThemeSwatches(themeOption.id),
					]),
				);

				if (!cancelled) {
					setSwatchesByTheme(Object.fromEntries(entries));
					setSwatchesLoaded(true);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setSwatchesLoaded(true);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [open, swatchesLoaded]);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8">
					<Palette className="h-4 w-4" />
					<span className="sr-only">Theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[min(18rem,calc(100vw-1rem))] p-2"
			>
				<div className="max-h-80 space-y-1 overflow-y-auto">
					{codeThemes.map((themeOption) => (
						<button
							key={themeOption.id}
							type="button"
							onClick={() => setCodeTheme(themeOption.id)}
							className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
								codeTheme === themeOption.id ? "bg-accent" : ""
							}`}
							title={themeOption.label}
						>
							<span className="inline-flex min-w-0 items-center gap-2">
								{codeTheme === themeOption.id ? (
									<Check className="h-3.5 w-3.5 text-primary" />
								) : (
									<span className="h-3.5 w-3.5 shrink-0" />
								)}
								<span className="truncate">{themeOption.label}</span>
							</span>
							<span className="inline-flex shrink-0 items-center gap-1">
								{(
									swatchesByTheme[themeOption.id] ?? [
										"var(--muted)",
										"var(--muted)",
										"var(--muted)",
										"var(--muted)",
									]
								).map((color, index) => (
									<span
										key={`${themeOption.id}-${index}`}
										className="h-2.5 w-2.5 rounded-full border border-border/80"
										style={{ backgroundColor: color }}
									/>
								))}
							</span>
						</button>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
