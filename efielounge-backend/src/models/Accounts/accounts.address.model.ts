
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Addresschema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "accounts",
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  address_components: [
    {
      long_name: { type: String },
      short_name: { type: String },
      types: [{ type: String }],
    },
  ],
  adr_address: { type: String },
  business_status: { type: String },
  current_opening_hours: {
    open_now: { type: Boolean },
    periods: [
      {
        close: {
          date: { type: String },
          day: { type: Number },
          time: { type: String },
        },
        open: {
          date: { type: String },
          day: { type: Number },
          time: { type: String },
        },
      },
    ],
    weekday_text: [{ type: String }],
  },
  formatted_address: { type: String },
  formatted_phone_number: { type: String },
  geometry: {
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    viewport: {
      northeast: { lat: { type: Number }, lng: { type: Number } },
      southwest: { lat: { type: Number }, lng: { type: Number } },
    },
  },
  icon: { type: String },
  icon_background_color: { type: String },
  icon_mask_base_uri: { type: String },
  international_phone_number: { type: String },
  name: { type: String },
  opening_hours: {
    open_now: { type: Boolean },
    periods: [
      {
        close: { day: { type: Number }, time: { type: String } },
        open: { day: { type: Number }, time: { type: String } },
      },
    ],
    weekday_text: [{ type: String }],
  },
  photos: [
    {
      height: { type: Number },
      html_attributions: [{ type: String }],
      photo_reference: { type: String },
      raw_reference: { fife_url: { type: String } },
      width: { type: Number },
    },
  ],
  place_id: { type: String },
  plus_code: {
    compound_code: { type: String },
    global_code: { type: String },
  },
  rating: { type: Number },
  reference: { type: String },
  reviews: [
    {
      author_name: { type: String },
      author_url: { type: String },
      profile_photo_url: { type: String },
      rating: { type: Number },
      relative_time_description: { type: String },
      text: { type: String },
      time: { type: Number },
    },
  ],
  types: [{ type: String }],
  url: { type: String },
  user_ratings_total: { type: Number },
  utc_offset: { type: Number },
  vicinity: { type: String },
});

const Address = mongoose.model("Address", Addresschema);
export default Address;
