import * as functions from "firebase-functions";
import * as express from "express";
import {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
} from "../handlers/screams";
import {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} from "../handlers/users";
import { FBAuth } from "../util/fbAuth";

const app = express();

// screams routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId",FBAuth, deleteScream)
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
app.get("/scream/:screamId/like",FBAuth,likeScream);
app.get("/scream/:screamId/unlike",FBAuth,unlikeScream);

// users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
