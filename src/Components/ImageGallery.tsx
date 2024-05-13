import React, { useState } from "react";
import ImageObject from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import { Image } from "../Image";
import "./ImageGallery.css";

const Img1 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/__2.webp";
const Img2 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/__71.webp";

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

      <CompareZoomPanPinch
        img1={selectedImages[0]?.url || Img1}
        img2={selectedImages[1]?.url || Img2}
      />
    </div>
  );
};

export default ImageGallery;
