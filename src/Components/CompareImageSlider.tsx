import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";

const CompareImageSlider = (props: {
  img1: string;
  img2: string;
  label1: string;
  label2: string;
  onError1: () => void;
  onError2: () => void;
}) => {
  return (
    <div>
      <ReactCompareSlider
        onlyHandleDraggable={true}
        boundsPadding={0}
        itemOne={
          <ReactCompareSliderImage
            alt={`Photo ${props.label1}`}
            src={props.img1}
            onError={props.onError1}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            alt={`Photo ${props.label2}`}
            src={props.img2}
            onError={props.onError2}
          />
        }
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              border: 0,
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              boxShadow: "none",
            }}
          />
        }
        keyboardIncrement='5%'
        position={50}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

export default CompareImageSlider;
