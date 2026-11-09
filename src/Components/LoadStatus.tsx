/** A one-line state message under a gallery title, with an optional retry. */
const LoadStatus = (props: { message: string; onRetry?: () => void }) => (
  <div className='load-status' role={props.onRetry ? "alert" : "status"}>
    <p>{props.message}</p>
    {props.onRetry ? (
      <button type='button' className='btn' onClick={props.onRetry}>
        Try again
      </button>
    ) : null}
  </div>
);

export default LoadStatus;
