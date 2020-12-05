import * as functions from "firebase-functions";
// const admin = require('firebase-admin');
import * as admin from "firebase-admin";
import * as express from "express";
const app = express();


admin.initializeApp();


app.get('/screams',(req,res) => {
    admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt','desc')
    .get()
    .then((data) => {
      let screams: any[] = [];
      data.forEach((doc) => {
        screams.push({
            screamId: doc.id,
            body: doc.data().body,
            userHandle: doc.data().userHandle,
            createdAt: doc.data().createdAt
        });
      });

      return res.json(screams);
    })
    .catch((err) => console.error(err));
});


app.post('/scream',(req,res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
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
        });
});


  exports.api = functions.https.onRequest(app);


