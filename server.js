const enviarEmail = async (destino, assunto, corpo) => {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destino,
      subject: assunto,
      text: corpo.replace(/(<([^>]+)>)/gi, ""), // fallback texto puro
      html: corpo
    });
  };
  
  const capitalizar = (texto) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };
  
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
  
  const verificarEEnviarEmails = async () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
  
    const snapshot = await db.collection('usuarios').get();
  
    snapshot.forEach(async (doc) => {
      const dados = doc.data();
  
      const afastamento = dados.afastamento ? new Date(dados.afastamento.split('/').reverse().join('-')) : null;
      const retorno = dados.retorno ? new Date(dados.retorno.split('/').reverse().join('-')) : null;
  
      const destino = 'fernando.cruz@silimed.com.br'; // ➡️ Troque aqui para o e-mail real
  
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
  