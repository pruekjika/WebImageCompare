import "./App.css";
import { useEffect, useState } from "react";
import ImageGallery from "./Components/ImageGallery";
import Image360View from "./Components/Image360View";
import { fetchImagesFromRepo } from "./api";
import { Image } from "./Image";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  useEffect(() => {
    fetchImagesFromRepo(
      "https://api.github.com/repos/pruekjika/GardenImgDB/contents/ImageDB/"
    )
      .then((images) => {
        console.log(images);
        setImages(images);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const [images360, setImages360] = useState<Image[]>([]);
  useEffect(() => {
    fetchImagesFromRepo(
      "https://api.github.com/repos/pruekjika/GardenImg360/contents/"
    )
      .then((images) => {
        setImages360(images);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <>
      {/* image gallery if final call because it easier to send image button data to compare */}
      <Image360View images={images360} />
      <ImageGallery images={images} />
    </>
  );
}

export default App;
