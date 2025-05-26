// setAdminClaim.js
const admin = require('firebase-admin');

// Load your service account key
const serviceAccount = require('./serviceAccountKey.json');

// Replace this with the actual UID of the admin user
const uidToMakeAdmin = "hO1uvtVNfTMe9D5BulmyaQnnFFD2";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim() {
  if (!uidToMakeAdmin) {
    console.error("❌ UID is missing.");
    return;
  }

  try {
    await admin.auth().setCustomUserClaims(uidToMakeAdmin, { admin: true });
    console.log(`✅ Successfully set 'admin: true' for user UID: ${uidToMakeAdmin}`);
    console.log("🔄 Ask the admin user to log out and log in again to refresh their token.");
  } catch (error) {
    console.error("❌ Error setting claim:", error);
  }
}

setAdminClaim();
