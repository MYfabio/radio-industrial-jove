const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Inicializar clientes
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: Claude API con interpretación de comandos
app.post('/api/claude', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Prompt para que Claude interprete comandos de edición
    const systemPrompt = `Eres un asistente que interpreta comandos para modificar una página web.
Detecta si el usuario quiere:
1. Cambiar título: responde JSON {"action": "update-title", "value": "..."}
2. Cambiar subtítulo: responde JSON {"action": "update-subtitle", "value": "..."}
3. Cambiar descripción: responde JSON {"action": "update-description", "value": "..."}
4. Cambiar color de fondo: responde JSON {"action": "update-bg-color", "value": "#RRGGBB"}
5. Cambiar color de texto: responde JSON {"action": "update-text-color", "value": "#RRGGBB"}
6. Generar contenido: responde JSON {"action": "generate", "topic": "..."}

Si no es un comando, responde normalmente con un JSON {"action": "chat", "response": "..."}

El sitio actual tiene:
- Título: "${siteData.title}"
- Subtítulo: "${siteData.subtitle}"
- Descripción: "${siteData.description}"`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
    });

    const responseText = response.content[0].text;
    
    // Intentar parsear como JSON
    let result = { action: 'chat', response: responseText };
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Si no es JSON válido, es una respuesta normal
    }

    // Ejecutar acciones si es necesario
    if (result.action && result.action !== 'chat') {
      await executeAction(result);
    }

    res.json({
      success: true,
      response: result.response || responseText,
      action: result.action,
      data: siteData
    });
  } catch (error) {
    console.error('Error en Claude:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ejecutar acciones de edición
async function executeAction(action) {
  switch (action.action) {
    case 'update-title':
      siteData.title = action.value;
      break;
    case 'update-subtitle':
      siteData.subtitle = action.value;
      break;
    case 'update-description':
      siteData.description = action.value;
      break;
    case 'update-bg-color':
      siteData.styles.bgColor = action.value;
      break;
    case 'update-text-color':
      siteData.styles.textColor = action.value;
      break;
    case 'generate':
      // Generar contenido con Claude
      const genResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          { role: 'user', content: `Genera una descripción corta (2-3 frases) sobre: ${action.topic}` }
        ],
      });
      siteData.description = genResponse.content[0].text;
      break;
  }
}

// Endpoint: ChatGPT API
app.post('/api/chatgpt', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: message }
      ],
    });

    res.json({
      success: true,
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error en ChatGPT:', error);
    res.status(500).json({ error: error.message });
  }
});

// Almacenamiento de cambios
let siteData = {
  title: 'Ràdio Industrial Jove',
  subtitle: 'La radio de los estudiantes',
  description: 'Web de la radio escolar',
  styles: {
    bgColor: '#faf9f5',
    textColor: '#333333',
    accentColor: '#007AFF'
  }
};

// Endpoint: Actualizar contenido
app.post('/api/update-content', (req, res) => {
  try {
    const { title, subtitle, description } = req.body;
    if (title) siteData.title = title;
    if (subtitle) siteData.subtitle = subtitle;
    if (description) siteData.description = description;
    
    res.json({ success: true, data: siteData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Actualizar estilos
app.post('/api/update-styles', (req, res) => {
  try {
    const { bgColor, textColor, accentColor } = req.body;
    if (bgColor) siteData.styles.bgColor = bgColor;
    if (textColor) siteData.styles.textColor = textColor;
    if (accentColor) siteData.styles.accentColor = accentColor;
    
    res.json({ success: true, data: siteData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Obtener datos actuales
app.get('/api/data', (req, res) => {
  res.json(siteData);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Editor disponible en /editor.html`);
  console.log(`Claude API disponible en POST /api/claude`);
  console.log(`ChatGPT API disponible en POST /api/chatgpt`);
});
