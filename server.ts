require("dotenv").config();

import { app } from "./app";
import connectDb from "./utils/db";

app.listen(process.env.PORT, () => {
  console.log(`server is runnig on  http://localhost:${process.env.PORT}`);
  connectDb();
});
