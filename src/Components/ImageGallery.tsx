import React, { useState } from "react";
import ImageObject from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import { Image } from "../Image";
import "./ImageGallery.css";

const default_Img1 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
const default_Img2 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/71.webp";

export interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  const handleImageClick = (image: Image) => {
    if (selectedImages.length < 2) {
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, image]);
    } else {
      setSelectedImages((prevSelectedImages) => {
        if (prevSelectedImages[0] === image) {
          return [prevSelectedImages[1]];
        } else {
          return [image, prevSelectedImages[0]];
        }
      });
    }
  };

  const isSelected = (image: Image): boolean => {
    return selectedImages.includes(image);
  };

  return (
    <div>
      <h1 className='center'>Image compare</h1>
      <div className='image-gallery '>
        {images.map((image) => (
          <ImageObject
            key={image.name}
            imgUrl={image.url}
            imgName={image.name}
            onClick={() => handleImageClick(image)}
            style={isSelected(image) ? "is-selected" : "is-not-selected"}
          />
        ))}
      </div>

      <h2 className='center'>
        {selectedImages[0]?.name.replace(".webp", "")} vs{" "}
        {selectedImages[1]?.name.replace(".webp", "")}
      </h2>

      <CompareZoomPanPinch
        img1={selectedImages[0]?.url || default_Img1}
        img2={selectedImages[1]?.url || default_Img2}
      />
    </div>
  );
};

export default ImageGallery;
