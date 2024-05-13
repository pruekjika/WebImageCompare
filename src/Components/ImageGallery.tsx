import React, { useEffect, useState } from "react";
import ImageObject from "./ImageObject";
import CompareZoomPanPinch from "./CompareZoomPanPinch";
import { Image } from "../Image";
import "./ImageGallery.css";
import ExifReader from "exifreader";

const default_Img0 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
const default_Img1 =
  "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/71.webp";

export interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);

  const [imageDates, setImageDates] = useState<{
    date0: string;
    date1: string;
  }>({ date0: "", date1: "" });

  const formatDateTime = (dateTimeString: string): string => {
    const [datePart, timePart] = dateTimeString.split(" ");
    const [year, month, day] = datePart.split(":");
    const date = new Date(`${month}/${day}/${year} ${timePart}`);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [tags0, tags1] = await Promise.all([
        ExifReader.load(selectedImages[0]?.url || default_Img0),
        ExifReader.load(selectedImages[1]?.url || default_Img1),
      ]);
      const date0 = formatDateTime(
        tags0?.["DateTimeOriginal"]?.description || ""
      );
      const date1 = formatDateTime(
        tags1?.["DateTimeOriginal"]?.description || ""
      );
      setImageDates({ date0, date1 });
    };
    fetchData();
  }, [selectedImages]);

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
      <h1 className='center no-margin text-compare-number'>
        {selectedImages[0]?.name.replace(".webp", "") ?? "2"} -{" "}
        {selectedImages[1]?.name.replace(".webp", "") ?? "71"}
      </h1>

      <h2 className='center no-margin text-compare-date'>
        {imageDates.date0} - {imageDates.date1}
      </h2>

      <CompareZoomPanPinch
        img1={selectedImages[0]?.url || default_Img0}
        img2={selectedImages[1]?.url || default_Img1}
      />
    </div>
  );
};

export default ImageGallery;
