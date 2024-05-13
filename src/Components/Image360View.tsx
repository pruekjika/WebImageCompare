import React, { useState } from "react";
import { Image } from "../Image";
import ImageObject from "./ImageObject";
import "./ImageGallery.css";

export interface ImageGalleryProps {
  images: Image[];
}

const Image360View: React.FC<ImageGalleryProps> = ({ images }) => {
  const handleImageClick = (image: Image) => {
    window.open(image.url);
  };

  return (
    <div>
      <h1 className='center'>360 Image view</h1>
      <div className='image-gallery-360'>
        {images.map((image) => (
          <ImageObject
            key={image.name}
            imgUrl={image.url}
            imgName={image.name}
            onClick={() => handleImageClick(image)}
            style={"is-not-selected"}
          />
        ))}
      </div>
    </div>
  );
};

export default Image360View;
