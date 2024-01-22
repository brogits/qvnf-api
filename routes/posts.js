const express = require('express');
const router = express.Router();
const busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const UUID = require('uuid-v4');

const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'brogits-github-io.appspot.com'
});

const uuid = UUID();
const db = getFirestore();
const storage =  admin.storage().bucket();
let fileData = {};

/* GET posts listing. */
router.get('/',  (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  let posts = [];
  db.collection('posts').orderBy('date', 'desc').get().then(result => {
    result.docs.forEach((doc) => {
      posts.push(doc.data())
    })
    res.send(posts);
  }).catch(err => {
    console.log(err);
  });
});

router.post("/", (req, res) => {
  let model = {};
  
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Type','multipart/form-data; boundary=something')

  const bb = busboy({ headers: req.headers });

  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    const filePath = path.join(os.tmpdir(), filename);

    file.pipe(fs.createWriteStream(filePath));
    fileData = {filePath, mimeType};
  });

  
  bb.on("field", (name, val, info) => {
    model[name] = val;
  });

  bb.on("finish", () => {
    storage.upload(
      fileData.filePath,
      {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: fileData.contentType,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        if (err) {
          res.send ({success: false, message: err.message, error: err});
          return;
        }
        savePost(uploadedFile.name);
      }
    );
  });

  function savePost(fileName) {
    model.date = model.date ? parseInt(model.date) : Date.now;
    model.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${fileName}?alt=media&token=${uuid}`;
    db.collection("posts").add(model).then((result) => {
      res.send(model);
    })
    .catch((err) => {
      console.log(err);
    });  
  }

  req.pipe(bb);
});


/* POST */

function setHeaders(res) {
  
}


module.exports = router;
