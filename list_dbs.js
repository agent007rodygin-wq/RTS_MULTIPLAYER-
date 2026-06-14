import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, 'ai-studio-applet-webapp-7ac33-firebase-adminsdk-fbsvc-209f88001c.json'), 'utf8'));

async function listDbs() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/datastore'],
  });

  const client = await auth.getClient();
  const url = `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases`;
  
  const res = await client.request({ url });
  console.log("Доступные Firestore базы:");
  res.data.databases.forEach(db => {
    console.log(db.name.split('/').pop()); // just the db name part
  });
}

listDbs().catch(console.error);
