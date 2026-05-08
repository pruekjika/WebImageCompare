import "./ImageGallery.css";

const ImageObject = (props: {
  imgUrl: string;
  imgName: string;
  imgDate?: string;
  style: string;
  onClick: () => void;
}) => {
  return (
    <div className={`image-container ${props.style}`} onClick={props.onClick}>
      <div className='center-text'>
        <p className='text-img-name'>{`${props.imgName
          .replace(".webp", "")
          .replace(".jpg", "")}`}</p>
        {props.imgDate ? <p className='text-img-date'>{props.imgDate}</p> : null}
      </div>
    </div>
  );
};

export default ImageObject;
