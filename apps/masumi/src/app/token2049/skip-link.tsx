import ui from "./guide-ui.module.css";

export default function SkipLink() {
  return <a href="#guide-main" className={ui.skipLink}>Skip to guide</a>;
}
