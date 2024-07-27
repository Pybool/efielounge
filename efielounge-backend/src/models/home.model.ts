import mongoose from "mongoose";
const Schema = mongoose.Schema;

const HomeSchema = new Schema({
  banner: {
    type: String,
    default: null,
    required: true,
  },
  promotion:{
  }
});

const Home = mongoose.model("home", HomeSchema);
export default Home;
