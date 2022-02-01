import dotenv from "dotenv-flow";
dotenv.config();
import app from "./server";
import { createConnection } from "typeorm";

createConnection({
  type: "sqlite",
  database: "books.sqlite",
  entities: [__dirname + "/entity/*.js"],
  synchronize: true,
});

// Start the application by listening to specific port
const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Book server listening at http://localhost:${port}`);
});
