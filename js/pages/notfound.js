import { h, link, arrow } from "../ui.js";
import { setMeta } from "../app.js";
export default function NotFound() {
  setMeta({ title: "Not found" });
  return h("div", { style: { textAlign: "center", padding: "10vh 0" } }, h("p", { class: "eyebrow" }, "404"), h("h1", { style: { marginTop: "12px" } }, "That decision doesn't exist."), h("p", { class: "muted", style: { marginTop: "12px" } }, "Nothing to learn here, except that the link was wrong."), h("div", { style: { marginTop: "28px" } }, link("/", h("span", { class: "btn" }, "Back to decisions ", arrow()))));
}
