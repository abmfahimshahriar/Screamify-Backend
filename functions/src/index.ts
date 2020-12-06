import * as functions from "firebase-functions";
import * as express from "express";
import { getAllScreams, postOneScream } from "../handlers/screams";
import { signup, login } from "../handlers/users";
import { FBAuth } from "../util/fbAuth";

const app = express();

// screams routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

// authentication routes
app.post("/signup", signup);

app.post("/login", login);

exports.api = functions.https.onRequest(app);
