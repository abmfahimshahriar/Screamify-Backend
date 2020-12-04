import * as functions from "firebase-functions";
// const admin = require('firebase-admin');
import * as admin from "firebase-admin";

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  //   functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello world!");
});

export const getScreams = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection('screams')
    .get()
    .then((data) => {
      let screams: any[] = [];
      data.forEach((doc) => {
        screams.push(doc.data());
      });

      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

export const createScreams   = functions.https.onRequest((req, res) => {

    // if(req.method !== 'POST') {
    //     return res.status(400).json({error: 'Method not allowed.'});
    // }
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({message: `document ${doc.id} created successfully`});
        })
        .catch((err) => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        })
  });


