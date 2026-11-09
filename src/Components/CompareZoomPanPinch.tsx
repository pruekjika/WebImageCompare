import { useState } from "react";
import CompareImageSlider from "./CompareImageSlider.js";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./ImageGallery.css";

const fill = { width: "100%", height: "100%" } as const;

type SidePhoto = { url: string; label: string; date: string };

/** A corner label on the photo: tag, number, date. A photo still on its way shows a spinner. */
const StageLabel = (props: { slot: "a" | "b"; photo: SidePhoto; loading: boolean }) => (
  <span
    className='stage-label'
    data-slot={props.slot}
    data-loading={props.loading || undefined}
    aria-hidden='true'
  >
    <b>{props.slot.toUpperCase()}</b> {props.photo.label}
    {props.photo.date ? <span>{props.photo.date}</span> : null}
    {props.loading ? <i className='stage-spinner' /> : null}
  </span>
);

const CompareZoomPanPinch = (props: { a: SidePhoto; b: SidePhoto }) => {
  // Photos that loaded or failed, by URL: a slow photo says it's loading, a bad file says so
  // instead of showing a blank half.
  const [loaded, setLoaded] = useState<Record<string, true>>({});
  const [failed, setFailed] = useState<Record<string, true>>({});
  const mark =
    (set: typeof setLoaded, url: string) => () =>
      set((prev) => (prev[url] ? prev : { ...prev, [url]: true }));

  const { a, b } = props;
  const loadingA = !loaded[a.url] && !failed[a.url];
  const loadingB = !loaded[b.url] && !failed[b.url];
  const broken = [failed[a.url] ? a.label : null, failed[b.url] ? b.label : null].filter(Boolean);

  return (
    <>
      <TransformWrapper initialScale={1} minScale={1} maxScale={20} centerOnInit disablePadding>
        <TransformComponent wrapperStyle={fill} contentStyle={fill}>
          <CompareImageSlider
            img1={a.url}
            img2={b.url}
            label1={a.label}
            label2={b.label}
            onLoad1={mark(setLoaded, a.url)}
            onLoad2={mark(setLoaded, b.url)}
            onError1={mark(setFailed, a.url)}
            onError2={mark(setFailed, b.url)}
          />
        </TransformComponent>
      </TransformWrapper>
      <StageLabel slot='a' photo={a} loading={loadingA} />
      <StageLabel slot='b' photo={b} loading={loadingB} />
      {broken.length > 0 ? (
        <p className='stage-error' role='alert'>
          Photo {broken.join(" and ")} didn&apos;t load. Pick another photo.
        </p>
      ) : null}
    </>
  );
};

export default CompareZoomPanPinch;
