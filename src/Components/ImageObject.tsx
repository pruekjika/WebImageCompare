import { useState } from "react";
import "./ImageGallery.css";

export type Slot = "a" | "b";

/** One frame on the timeline: a small preview, its number and date, and its A/B tag. */
const ImageObject = (props: {
  label: string;
  date?: string;
  thumb: string;
  slot: Slot | null;
  onClick: () => void;
}) => {
  const [thumbFailed, setThumbFailed] = useState(false);
  const slotName = props.slot ? props.slot.toUpperCase() : null;
  return (
    <button
      type='button'
      className='frame'
      data-label={props.label}
      data-slot={props.slot ?? undefined}
      onClick={props.onClick}
      aria-pressed={props.slot !== null}
      aria-label={`Photo ${props.label}${props.date ? `, ${props.date}` : ""}${
        slotName ? `, shown as ${slotName}` : ""
      }`}
    >
      <span className='frame-image'>
        {thumbFailed ? null : (
          <img
            src={props.thumb}
            alt=''
            loading='lazy'
            decoding='async'
            draggable={false}
            onError={() => setThumbFailed(true)}
          />
        )}
        {slotName ? <span className='frame-tag'>{slotName}</span> : null}
      </span>
      <span className='frame-num'>{props.label}</span>
      <span className='frame-date'>{props.date || " "}</span>
    </button>
  );
};

export default ImageObject;
