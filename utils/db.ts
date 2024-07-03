import mongoose from "mongoose";

const dburl: string = process.env.DB_URI || "";

const connectDb = async () => {
  try {
    await mongoose.connect(dburl).then((data: any) => {
      console.log(`database is connected to ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;
