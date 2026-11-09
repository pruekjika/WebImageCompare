import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";

// Both photos are aligned shots of the same frame, so `contain` letterboxes them identically
// and the handle compares the same ground on both sides.
const imageStyle = { objectFit: "contain" } as const;

const CompareImageSlider = (props: {
  img1: string;
  img2: string;
  label1: string;
  label2: string;
  onError1: () => void;
  onError2: () => void;
}) => (
  <ReactCompareSlider
    onlyHandleDraggable={true}
    boundsPadding={0}
    itemOne={
      <ReactCompareSliderImage
        alt={`Photo ${props.label1}`}
        src={props.img1}
        style={imageStyle}
        onError={props.onError1}
      />
    }
    itemTwo={
      <ReactCompareSliderImage
        alt={`Photo ${props.label2}`}
        src={props.img2}
        style={imageStyle}
        onError={props.onError2}
      />
    }
    handle={
      <ReactCompareSliderHandle
        buttonStyle={{
          border: 0,
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          boxShadow: "0 1px 6px rgba(0, 0, 0, 0.45)",
        }}
      />
    }
    keyboardIncrement='5%'
    position={50}
    style={{ height: "100%", width: "100%" }}
  />
);

export default CompareImageSlider;
