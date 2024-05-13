import React, { useEffect, useState } from "react";
import ExifReader from "exifreader";

const What = () => {
  const [imageDate, setImageDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const tags = await ExifReader.load(
        "https://raw.githubusercontent.com/pruekjika/GardenImgDB/main/ImageDB/2.webp"
      );
      const date = tags["DateTimeOriginal"].description;
      setImageDate(date);
    };

    fetchData();
  }, []);

  return <div>{imageDate}</div>;
};

export default What;
