import React, { useEffect } from "react";
import ExifReader from "exifreader";

const What = async () => {
  // "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
  // "https://raw.githubusercontent.com/pruekjika/GardenImg360/main/low-2.jpg";

  const tags = await ExifReader.load(
    "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp"
  );

  const imageDate = tags["DateTimeOriginal"].description;
  // const unprocessedTagValue = tags["DateTimeOriginal"].value;
  console.log(imageDate);

  return <div>what</div>;
};

export default What;
