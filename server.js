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

// Função para enviar e-mail (agora só usando HTML)
const enviarEmail = async (destino, assunto, corpo) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: destino,
    subject: assunto,
    html: corpo
  });
};

// Função para capitalizar textos
const capitalizar = (texto) => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

// Template HTML do e-mail
const gerarCorpoEmail = ({ tipo, nome, funcao, status }) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
          <div style="text-align: center;">
            <img src="https://controle-ferias-backend.onrender.com/logo.png" alt="Logo Silimed" style="max-width: 120px; margin-bottom: 20px;" />
            <h2 style="color: #d9534f; text-align: center;">${tipo} de usuário</h2>
            <p style="font-size: 16px;"><strong>Nome:</strong> ${capitalizar(nome)}</p>
            <p style="font-size: 16px;"><strong>Função:</strong> ${capitalizar(funcao)}</p>
            <p style="font-size: 16px;">
              <strong>Status:</strong> 
              <span style="color: ${status === 'bloqueado' ? '#d9534f' : '#5cb85c'}; font-weight: bold;">
                ${capitalizar(status)}
              </span>
            </p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 14px; color: #888; text-align: center;">
              Este e-mail foi enviado automaticamente pelo sistema de controle de férias.<br/>
              Por favor, não responda.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Função principal para verificar e disparar e-mails
const verificarEEnviarEmails = async () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const snapshot = await db.collection('usuarios').get();

  snapshot.forEach(async (doc) => {
    const dados = doc.data();

    const afastamento = dados.afastamento ? new Date(dados.afastamento.split('/').reverse().join('-')) : null;
    const retorno = dados.retorno ? new Date(dados.retorno.split('/').reverse().join('-')) : null;

    const destino = 'novoemail@empresa.com'; // <- Troque aqui para o e-mail real de destino

    if (afastamento && afastamento.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de afastamento para ${dados.nome}`);

      const corpo = gerarCorpoEmail({
        tipo: 'Afastamento',
        nome: dados.nome,
        funcao: dados.funcao,
        status: 'bloqueado'
      });

      await enviarEmail(destino, `Afastamento - ${dados.nome}`, corpo);
    }

    if (retorno && retorno.getTime() === hoje.getTime()) {
      console.log(`📤 Enviando email de retorno para ${dados.nome}`);

      const corpo = gerarCorpoEmail({
        tipo: 'Retorno',
        nome: dados.nome,
        funcao: dados.funcao,
        status: 'ativo'
      });

      await enviarEmail(destino, `Retorno - ${dados.nome}`, corpo);
    }
  });
};

// Agendamento: rodar às 08:00
cron.schedule('0 8 * * *', () => {
  console.log('⏰ Rodando verificação de emails às 08:00');
  verificarEEnviarEmails();
});

// Rota manual para teste
app.get('/teste', (req, res) => {
  verificarEEnviarEmails();
  res.send('Verificação manual executada.');
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
