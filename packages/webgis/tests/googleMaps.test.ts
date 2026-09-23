import { describe, expect, it } from "vitest";
import { parseGoogleMapsUrl } from "../src/providers/googleMaps";

describe("parseGoogleMapsUrl", () => {
  it("parses direct coordinates", () => {
    expect(parseGoogleMapsUrl("10.2669024,106.3588832")).toEqual({
      lat: 10.2669024,
      lng: 106.3588832
    });
  });

  it("parses Google Maps at coordinates", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/place/Test/@10.2678571,106.3577652,17z"
      )
    ).toEqual({ lat: 10.2678571, lng: 106.3577652 });
  });

  it("parses data coordinates", () => {
    expect(
      parseGoogleMapsUrl(
        "https://www.google.com/maps/place/Test/data=!3d10.2669024!4d106.3588832"
      )
    ).toEqual({ lat: 10.2669024, lng: 106.3588832 });
  });

  it("rejects impossible coordinates", () => {
    expect(parseGoogleMapsUrl("100,200")).toBeNull();
  });
});
