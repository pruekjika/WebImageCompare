import "./ImageGallery.css";

const ImageObject = (props: {
  imgName: string;
  imgDate?: string;
  selected: boolean;
  onClick: () => void;
}) => {
  const label = props.imgName.replace(".webp", "").replace(".jpg", "");
  return (
    <button
      type='button'
      className={`image-container ${props.selected ? "is-selected" : "is-not-selected"}`}
      onClick={props.onClick}
      aria-pressed={props.selected}
      title={props.imgDate ? `${label} · ${props.imgDate}` : label}
    >
      <span className='center-text'>
        <span className='text-img-name'>{label}</span>
        {props.imgDate ? <span className='text-img-date'>{props.imgDate}</span> : null}
      </span>
    </button>
  );
};

export default ImageObject;
