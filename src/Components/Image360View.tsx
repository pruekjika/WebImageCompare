import React from "react";
import { Image } from "../Image";
import "./Image360.css";
import ImageObject360 from "./ImageObject360";

export interface ImageGalleryProps {
  images: Image[];
}

const Image360View: React.FC<ImageGalleryProps> = ({ images }) => {
  const handleImageClick = (image: Image) => {
    window.open(
      `https://renderstuff.com/tools/360-panorama-web-viewer-sharing/?image=${image.url}`
    );
    // url link is
    // https://raw.githubusercontent.com/pruekjika/GardenImg360/main/low-2.jpg

    // real link is
    // https://renderstuff.com/tools/360-panorama-web-viewer-sharing/?image=https://raw.githubusercontent.com/meangpu/GardenImageTest/main/newHomeLocation.JPG&title=newHomeLocation
  };

  return (
    <div>
      <h1 className='center'>360 Image view</h1>
      <div className='image-gallery-360'>
        {images.map((image) => (
          <ImageObject360
            key={image.name}
            imgUrl={image.url}
            imgName={image.name}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default Image360View;
