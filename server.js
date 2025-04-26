require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { db } = require('./firebase');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  }
});

const enviarEmail = async (destino, assunto, corpo) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destino,
    subject: assunto,
    text: corpo
  });
};

const verificarEEnviarEmails = async () => {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const snapshot = await db.collection('usuarios').get();

  snapshot.forEach(async (doc) => {
    const dados = doc.data();

    const afastamento = dados.afastamento ? new Date(dados.afastamento.split('/').reverse().join('-')) : null;
    const retorno = dados.retorno ? new Date(dados.retorno.split('/').reverse().join('-')) : null;

    if (afastamento && afastamento.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de afastamento para ${dados.nome}`);
      await enviarEmail('fernando.cruz@silimed.com.br', `Afastamento - ${dados.nome}`, `${dados.nome} será afastado hoje.`);
    }

    if (retorno && retorno.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de retorno para ${dados.nome}`);
      await enviarEmail('fernando.cruz@silimed.com.br', `Retorno - ${dados.nome}`, `${dados.nome} retorna hoje.`);
    }
  });
};

cron.schedule('0 8 * * *', () => {
  console.log('⏰ Rodando verificação de emails às 08:00');
  verificarEEnviarEmails();
});

app.get('/teste', (req, res) => {
  verificarEEnviarEmails();
  res.send('Verificação manual executada.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
