// /api/calculate.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).json({ message: `Método ${request.method} não permitido.` });
    }

    // --- INÍCIO DO CÓDIGO DE DEPURAÇÃO ---
    console.log("Iniciando a função /api/calculate...");
    const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

    if (!MELHOR_ENVIO_TOKEN) {
        // Se o token não for encontrado, loga um erro claro e encerra
        console.error('ERRO CRÍTICO: A variável de ambiente MELHOR_ENVIO_TOKEN não foi encontrada!');
        return response.status(500).json({ message: 'Erro de configuração no servidor: Token de autenticação ausente.' });
    } else {
        // Se o token for encontrado, loga uma confirmação (sem expor o token inteiro)
        console.log('Variável MELHOR_ENVIO_TOKEN encontrada. Início do token:', MELHOR_ENVIO_TOKEN.substring(0, 5) + '...');
    }
    // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

    try {
        const apiResponse = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'CalculadoraDeFrete/1.0 (seu-contato@seu-dominio.com)'
            },
            body: JSON.stringify(request.body)
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            // Loga a resposta de erro da API do Melhor Envio para mais detalhes
            console.error('API do Melhor Envio retornou um erro:', { status: apiResponse.status, body: data });
            const errorMessage = data.message || data.error || 'Erro desconhecido retornado pela API de frete.';
            return response.status(apiResponse.status).json({ message: errorMessage });
        }
        
        console.log("Cálculo de frete bem-sucedido.");
        return response.status(200).json(data);

    } catch (error) {
        console.error('Erro ao conectar com a API do Melhor Envio:', error);
        return response.status(500).json({ message: 'Erro interno do servidor ao tentar calcular o frete.' });
    }
}