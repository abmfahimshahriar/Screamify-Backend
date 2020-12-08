import { admin, db } from "../util/admin";
import firebase from "firebase";
import { firebaseConfig } from "../util/config";
import { validateSignupData, validateLoginData, reduceUserDetails} from "../util/validators";

const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

firebase.initializeApp(firebaseConfig);

export const signup = (req: any, res: any) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  const noImg = 'no-img.png';

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
              imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
};

export const login = (req: any, res: any) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

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
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else return res.status(500).json({ error: err.code });
    });

  return;
};

// add user details
export const addUserDetails = (res:any,req:any) => {
   let userDetails = reduceUserDetails(res.body);

   db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
      return res.status(201).json({message: 'User updated sucessfully'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
}


export const uploadImage = (req: any, res: any) => {
  const busboy = new Busboy({ headers: req.headers });

  let imageFileName:any;
  let imageToBeUploaded: any = {};

  busboy.on(
    "file",
    (
      fieldname: any,
      file: any,
      filename: any,
      encoding: any,
      mimetype: any
    ) => {
      if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return res.status(400).json({error : 'Wrong file type submitted'});
      }
      const imageExtension = filename.split(".")[
        filename.split(".").length - 1
      ];
      imageFileName = `${Math.round(
        Math.random() * 1000000000
      )}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = {
        filepath,
        mimetype,
      };
      file.pipe(fs.createWriteStream(filepath));
    }
  );

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            comtentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({imageUrl});
      })
      .then(() => {
        return res.status(200).json({message: 'Image uploaded successfully.'});
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code});
      })
  });
  busboy.end(req.rawBody);
};
