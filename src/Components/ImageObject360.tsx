import "./Image360.css";

const ImageObject360 = (props: {
  imgUrl: string;
  imgName: string;
  onClick: () => void;
}) => {
  return (
    <div className={`image-container-360`} onClick={props.onClick}>
      <img src={props.imgUrl} alt={props.imgName} className='image-360' />

      <div className='center-text'>
        <p className='text-img-name'>{`${props.imgName
          .replace("__", "")
          .replace(".webp", "")
          .replace(".jpg", "")}`}</p>
        {/* <p className='text-img-date'>{`${props.imgName}`}</p> */}
      </div>
    </div>
  );
};

export default ImageObject360;
