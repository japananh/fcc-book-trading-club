/* eslint-disable no-console */
import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import path from "path";

import clientRoutes from "./routes/client";
import apiRoutes from "./routes/api";
import fccTestingRoutes from "./routes/fcctesting";
import runner from "./test-runner";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" })); // For FCC testing purposes only

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				styleSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://code.jquery.com/jquery-3.6.0.min.js",
					"https://fcc-book-trading-club.herokuapp.com/",
					"https://cdn.freecodecamp.org/universal/favicons/favicon-32x32.png",
					"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
				],
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://code.jquery.com/jquery-3.2.1.slim.min.js",
					"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js",
					// "https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js",
					"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
					"https://fcc-book-trading-club.herokuapp.com/",
					// "https://cdn.freecodecamp.org/universal/favicons/favicon-32x32.png",
				],
			},
		},
		xssFilter: true,
		nocache: true,
		noSniff: true,
		hidePoweredBy: true,
	})
);

app.use("/public", express.static(`${process.cwd()}/public`));

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");

clientRoutes(app);

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

app.use((_req: Request, res: Response) => {
	res.render("not-found");
});

mongoose.connect(config.db.uri, config.db.options).then(() => {
	console.log("Connected to mongodb");

	const port: number = parseInt(config.port as string, 10) || 3000;
	// Start our server and tests!
	app.listen(port, () => {
		console.log(`Listening on port ${config.port}`);

		if (config.env === "test") {
			console.log("Running Tests...");

			setTimeout(() => {
				try {
					runner.run();
					console.log("Completed test");
				} catch (e) {
					console.log("Tests are not valid:", e);
				}
			}, 1500);
		}
	});
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app; // for testing
