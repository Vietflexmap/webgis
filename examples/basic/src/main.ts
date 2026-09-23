import "maplibre-gl/dist/maplibre-gl.css";
import { createMap, MeasureTool } from "@vietflex/webgis";
import "./style.css";

const map = createMap({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [106.7, 10.8],
  zoom: 10,
  hash: true
});

const status = document.querySelector<HTMLSpanElement>("#status");

const measure = new MeasureTool(map, {
  onChange(result) {
    if (status) status.textContent = result?.formatted ?? "Đang chọn điểm…";
  },
  onFinish(result) {
    if (status) status.textContent = "Kết quả: " + result.formatted;
  }
});

document.querySelector("#distance")?.addEventListener("click", () => {
  measure.start("distance");
  if (status) status.textContent = "Bấm các điểm, nhấp đúp để kết thúc";
});

document.querySelector("#area")?.addEventListener("click", () => {
  measure.start("area");
  if (status) status.textContent = "Bấm ít nhất 3 điểm, nhấp đúp để kết thúc";
});

document.querySelector("#clear")?.addEventListener("click", () => {
  measure.clear();
  if (status) status.textContent = "Đã xóa";
});
