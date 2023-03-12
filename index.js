const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const { helloRoutes, apiRoutes } = require("./routes");

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); // compress responses to enable server-sent events
app.use(helmet());

// routes
app.use("/", helloRoutes);
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(
		`Upload Events service listening at ${process.env.SERVER_URL}${PORT}`
	);
});
