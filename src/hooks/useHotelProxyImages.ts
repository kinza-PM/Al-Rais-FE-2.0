import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../services/axios";

async function fetchProxyImages(
    imageUrls: string[],
    signal?: AbortSignal,
): Promise<string[]> {
    const promises = imageUrls.map(async (original) => {
        if (!original) return "";
        try {
            const base64 = await api.get<string>(
                "/imageProxy",
                { imageUrl: original },
                signal,
            );

            const extMatch = original.match(/\.(png|jpg|jpeg|gif|webp)$/i);
            let mime = "jpeg";
            if (extMatch) {
                mime =
                    extMatch[1].toLowerCase() === "jpg"
                        ? "jpeg"
                        : extMatch[1].toLowerCase();
            }
            return `data:image/${mime};base64,${base64}`;
        } catch (err: any) {
            if (err.name === "AbortError" || err.code === "ERR_CANCELED") throw err;
            console.error("Error loading image:", err);
            return "";
        }
    });
    return Promise.all(promises);
}

export function useHotelProxyImages(imageUrls: string[]) {
    const imageKey = imageUrls.join("|");

    return useQuery({
        queryKey: ["hotelProxyImages", imageKey],
        queryFn: ({ signal }) => fetchProxyImages(imageUrls, signal),
        enabled: imageUrls.length > 0,
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        placeholderData: keepPreviousData,
    });
}
