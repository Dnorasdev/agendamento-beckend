const admin = require('firebase-admin');

// Verifica se a variável de ambiente existe
if (!process.env.FIREBASE_CONFIG) {
  throw new Error('FIREBASE_CONFIG não encontrado nas variáveis de ambiente!');
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  // Corrige a private_key: substitui \\n por \n
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
} catch (error) {
  console.error('Erro ao fazer JSON.parse ou ajustar private_key do FIREBASE_CONFIG:', error.message);
  throw new Error('FIREBASE_CONFIG inválido. Verifique se o JSON está corretamente formatado.');
}

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };
