import React from "react";
import EXIF from "exif-js";

const what = () => {
  const imageTarget = new Image();
  imageTarget.src =
    "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp";

  EXIF.getData(imageTarget, function () {
    const make = EXIF.getTag(this, "Make");
    const model = EXIF.getTag(this, "Model");
    const date = EXIF.getTag(this, "DateTimeOriginal");

    console.log("Make:", make);
    console.log("Model:", model);
    console.log("Date:", date);
  });
  return <div>what</div>;
};

export default what;
