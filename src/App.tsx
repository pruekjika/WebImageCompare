import "./App.css";
import { useEffect, useState } from "react";
import ImageGallery from "./Components/ImageGallery";
import Image360View from "./Components/Image360View";
import { fetchImagesFromRepo } from "./api";
import { Image } from "./Image";

const owner = "pruekjika";
const repo = "GardenImgDB";

function App() {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    fetchImagesFromRepo(owner, repo)
      .then((images) => {
        console.log(images);
        setImages(images);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <>
      {/* image gallery if final call because it easier to send image button data to compare */}
      <h1 className='center'>Image compare</h1>
      <Image360View />
      <ImageGallery images={images} />
    </>
  );
}

export default App;
