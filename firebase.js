const admin = require('firebase-admin');

// Verifica se a variável de ambiente existe
if (!process.env.FIREBASE_CONFIG) {
  throw new Error('FIREBASE_CONFIG não encontrado nas variáveis de ambiente!');
}

let serviceAccount;

try {
  // Tenta fazer o parse do JSON
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} catch (error) {
  console.error('Erro ao fazer JSON.parse do FIREBASE_CONFIG:', error.message);
  throw new Error('FIREBASE_CONFIG inválido. Verifique se o JSON está corretamente formatado.');
}

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exporta o Firestore
const db = admin.firestore();

module.exports = { db };
