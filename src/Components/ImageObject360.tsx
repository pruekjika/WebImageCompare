import "./Image360.css";

const ImageObject360 = (props: { imgUrl: string; imgName: string; href: string }) => {
  const label = props.imgName.replace("__", "").replace(".webp", "").replace(".jpg", "");
  return (
    <a
      className='image-container-360'
      href={props.href}
      target='_blank'
      rel='noopener noreferrer'
      title={`Open 360 photo ${label} in a new tab`}
    >
      <img src={props.imgUrl} alt={`360 photo ${label}`} className='image-360' loading='lazy' />
      <div className='center-text' aria-hidden='true'>
        <p className='text-img-name'>{label}</p>
      </div>
    </a>
  );
};

export default ImageObject360;
