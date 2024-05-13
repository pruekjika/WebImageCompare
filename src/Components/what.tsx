import React, { useEffect } from "react";
import EXIF from "exif-js";

const What = async () => {
  // "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";
  // "https://raw.githubusercontent.com/pruekjika/GardenImg360/main/low-2.jpg";

  const blob = await fetch(
    "https://raw.githubusercontent.com/pruekjika/GardenImg360/main/low-2.jpg"
  ).then((r) => r.blob()); //creating blob object

  const file = new File([blob], "cover.jpg", {
    type: "image/jpg",
  });

  console.log(file);
  return <div>what</div>;
};

export default What;
