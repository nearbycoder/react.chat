import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const q = query.q as string;

	if (!q) {
		return { error: "Missing query parameter 'q'" };
	}

	const apiKey = process.env.GIPHY_API_KEY;

	if (!apiKey) {
		return { error: "GIPHY_API_KEY not configured" };
	}

	const res = await fetch(
		`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=1&rating=pg-13`,
	);
	const data = await res.json();

	const gif = data.data?.[0];
	if (gif?.images?.fixed_height?.url) {
		return { url: gif.images.fixed_height.url };
	}

	return { error: "No GIF found" };
});
