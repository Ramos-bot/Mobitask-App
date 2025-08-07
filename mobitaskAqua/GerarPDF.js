import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default class GerarPDF {
    static async gerarPDF(analise) {
        try {
            // Template HTML para o PDF
            const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Análise de Piscina - Mobitask Aqua</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f8fbff;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              opacity: 0.9;
            }
            .content {
              padding: 30px 20px;
            }
            .cliente-section {
              background: #e3f2fd;
              border-left: 4px solid #1e88e5;
              padding: 15px;
              margin-bottom: 25px;
              border-radius: 5px;
            }
            .cliente-nome {
              font-size: 20px;
              font-weight: bold;
              color: #1565c0;
              margin-bottom: 5px;
            }
            .data {
              color: #666;
              font-size: 14px;
            }
            .analise-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 25px 0;
            }
            .parametro {
              background: #f8fbff;
              border: 1px solid #e1f5fe;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .parametro-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .parametro-valor {
              font-size: 24px;
              font-weight: bold;
              color: #1e88e5;
            }
            .parametro-unidade {
              font-size: 12px;
              color: #999;
            }
            .doses-section {
              background: #fff3e0;
              border: 1px solid #ffcc02;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .doses-title {
              font-size: 16px;
              font-weight: bold;
              color: #e65100;
              margin-bottom: 15px;
              text-align: center;
            }
            .dose-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #ffe0b2;
            }
            .dose-item:last-child {
              border-bottom: none;
            }
            .footer {
              background: #f5f5f5;
              padding: 20px;
              text-align: center;
              margin-top: 30px;
            }
            .assinatura {
              border-top: 2px solid #1e88e5;
              margin: 20px auto 10px;
              width: 200px;
              padding-top: 10px;
              font-size: 12px;
              color: #666;
            }
            .rodape {
              font-size: 12px;
              color: #999;
              margin-top: 15px;
            }
            .imagem-analise {
              text-align: center;
              margin: 25px 0;
            }
            .imagem-analise img {
              max-width: 100%;
              max-height: 200px;
              border-radius: 8px;
              border: 2px solid #e1f5fe;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🟦 Mobitask Aqua</div>
              <div class="subtitle">Relatório de Análise de Piscina</div>
            </div>
            
            <div class="content">
              <div class="cliente-section">
                <div class="cliente-nome">👤 ${analise.cliente}</div>
                <div class="data">📅 ${analise.data?.toDate().toLocaleDateString() || 'Data não disponível'}</div>
              </div>

              <div class="analise-grid">
                <div class="parametro">
                  <div class="parametro-label">💧 Cloro Livre</div>
                  <div class="parametro-valor">${analise.cloroAtual}</div>
                  <div class="parametro-unidade">ppm</div>
                </div>
                
                <div class="parametro">
                  <div class="parametro-label">🧪 pH</div>
                  <div class="parametro-valor">${analise.phAtual}</div>
                  <div class="parametro-unidade">escala</div>
                </div>
                
                <div class="parametro">
                  <div class="parametro-label">📦 Volume</div>
                  <div class="parametro-valor">${analise.volume}</div>
                  <div class="parametro-unidade">m³</div>
                </div>
                
                <div class="parametro">
                  <div class="parametro-label">📊 Estado</div>
                  <div class="parametro-valor" style="font-size: 18px;">
                    ${this.getEstadoPiscina(analise.cloroAtual, analise.phAtual)}
                  </div>
                </div>
              </div>

              ${analise.imageUrl ? `
                <div class="imagem-analise">
                  <img src="${analise.imageUrl}" alt="Imagem da análise" />
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Imagem da análise realizada
                  </div>
                </div>
              ` : ''}

              <div class="doses-section">
                <div class="doses-title">🧮 Doses Aplicadas</div>
                <div class="dose-item">
                  <span><strong>Cloro (Hipoclorito):</strong></span>
                  <span><strong>${analise.cloroDose} g</strong></span>
                </div>
                <div class="dose-item">
                  <span><strong>Corretor de pH:</strong></span>
                  <span><strong>${analise.phDose} g</strong></span>
                </div>
              </div>

              <div class="footer">
                <div class="assinatura">
                  Técnico Responsável
                </div>
                <div class="rodape">
                  <strong>Obrigado pela confiança na Mobitask Aqua! 💧</strong><br>
                  Sistema de gestão inteligente para piscinas<br>
                  Gerado em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

            // Gerar o PDF
            const { uri } = await Print.printToFileAsync({
                html,
                width: 595,  // A4 width
                height: 842, // A4 height
                margins: {
                    left: 20,
                    top: 20,
                    right: 20,
                    bottom: 20,
                },
            });

            // Partilhar o PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Análise ${analise.cliente} - Mobitask Aqua`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                console.log('Partilha não disponível neste dispositivo');
            }

            return uri;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    static getEstadoPiscina(cloro, ph) {
        const cloroNum = parseFloat(cloro);
        const phNum = parseFloat(ph);

        // Verificar se os valores estão nos intervalos ideais
        const cloroOk = cloroNum >= 1.0 && cloroNum <= 3.0;
        const phOk = phNum >= 7.2 && phNum <= 7.6;

        if (cloroOk && phOk) {
            return '✅ Ótimo';
        } else if (cloroOk || phOk) {
            return '⚠️ Regular';
        } else {
            return '❌ Atenção';
        }
    }
}
