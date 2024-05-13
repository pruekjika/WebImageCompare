/* eslint-disable @typescript-eslint/no-explicit-any */

// `https://api.github.com/repos/pruekjika/GardenImgDB/contents/ImageDB/`
import { Image } from "./Image";

const accessToken = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("GitHub access token not found");
}

export async function fetchImagesFromRepo(path: string): Promise<Image[]> {
  try {
    const response = await fetch(`${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch repository contents");
    }
    const data = await response.json();

    const images: Image[] = data
      .filter(
        (item: any) =>
          item.type === "file" && item.path.match(/\.(jpeg|jpg|png|gif|webp)$/i)
      )
      .map((item: any) => ({
        name: item.name,
        url: item.download_url,
      }))
      .sort((a: Image, b: Image) => {
        const regex = /\d+/g;
        const aNumber = Number(a.name.match(regex)?.[0]);
        const bNumber = Number(b.name.match(regex)?.[0]);
        return aNumber - bNumber;
      });

    return images;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
