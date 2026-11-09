import { useState } from "react";
import CompareImageSlider from "./CompareImageSlider.js";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./ImageGallery.css";

const fill = { width: "100%", height: "100%" } as const;

const CompareZoomPanPinch = (props: {
  img1: string;
  img2: string;
  label1: string;
  label2: string;
}) => {
  // Photos that failed to load, by URL, so a bad file says so instead of showing a blank half.
  const [failed, setFailed] = useState<Record<string, true>>({});
  const markFailed = (url: string) => () =>
    setFailed((prev) => (prev[url] ? prev : { ...prev, [url]: true }));

  const broken = [
    failed[props.img1] ? props.label1 : null,
    failed[props.img2] ? props.label2 : null,
  ].filter(Boolean);

  return (
    <>
      <TransformWrapper initialScale={1} minScale={1} maxScale={20} centerOnInit disablePadding>
        <TransformComponent wrapperStyle={fill} contentStyle={fill}>
          <CompareImageSlider
            img1={props.img1}
            img2={props.img2}
            label1={props.label1}
            label2={props.label2}
            onError1={markFailed(props.img1)}
            onError2={markFailed(props.img2)}
          />
        </TransformComponent>
      </TransformWrapper>
      {broken.length > 0 ? (
        <p className='stage-error' role='alert'>
          Photo {broken.join(" and ")} didn&apos;t load. Pick another photo.
        </p>
      ) : null}
    </>
  );
};

export default CompareZoomPanPinch;
