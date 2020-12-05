import * as functions from "firebase-functions";
// const admin = require('firebase-admin');
import * as admin from "firebase-admin";
import * as express from "express";
import firebase from "firebase";
// const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyBu4DnhSYUHb13ZnQPWGi4kXRvMuaykVBA",
  authDomain: "screamify-ebb96.firebaseapp.com",
  projectId: "screamify-ebb96",
  storageBucket: "screamify-ebb96.appspot.com",
  messagingSenderId: "588780498386",
  appId: "1:588780498386:web:932e1b005276a73229ec0b",
  measurementId: "G-B8TS79VVWW",
};

const app = express();
admin.initializeApp();
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams: any[] = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });

      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// signup route
const isEmail = (email: string) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

const isEmpty = (str: string) => {
  if (str.trim() == "") return true;
  else return false;
};
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  let errors: any = {};

  // email validation
  if (isEmpty(newUser.email)) errors.email = "Must not be empty";
  else if (!isEmail(newUser.email)) errors.email = "Must be a valid email";

  // password validation
  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let token: any;
  let userId;

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
          .then((data) => {
            token = data.user?.getIdToken();
            userId = data.user?.uid;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId,
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
          })
          .then(() => {
            return res.status(201).json({ token });
          })
          .catch((err) => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
              return res.status(400).json({ email: "Email already in use" });
            } else {
              return res.status(500).json({ error: err.code });
            }
          });
        
        return;
      }
    })
    .catch((err) => {
      console.error(err.code);
      return res.status(500).json({ error: err.code });
    });
  
  return;
});

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors: any = {};

  // email validation
  if (isEmpty(user.email)) errors.email = "Must not be empty";
  else if (!isEmail(user.email)) errors.email = "Must be a valid email";
  // password validation
  if (isEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user?.getIdToken();
    })
    .then((token) => {
      return res.status(200).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if(err.code === "auth/wrong-password") {
          return res.status(403).json({general : 'Wrong credentials, please try again'});
      }
      else return res.status(500).json({ error: err.code });
    });

  return;
});

exports.api = functions.https.onRequest(app);
