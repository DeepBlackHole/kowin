// Kahoot AI Solver - Background Service Worker
// Handles AI API calls (OpenAI or Anthropic Claude)

const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAIAnswer') {
    handleAIRequest(request.question, request.choices)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function handleAIRequest(question, choices) {
  console.log('Background: Processing AI request');
  console.log('Question:', question);
  console.log('Choices:', choices);

  // Get settings from storage
  const settings = await chrome.storage.sync.get(['aiProvider', 'apiKey']);

  if (!settings.apiKey) {
    throw new Error('No API key configured. Please set your API key in the extension popup.');
  }

  const provider = settings.aiProvider || AI_PROVIDERS.OPENAI;

  if (provider === AI_PROVIDERS.OPENAI) {
    return await getOpenAIAnswer(question, choices, settings.apiKey);
  } else if (provider === AI_PROVIDERS.ANTHROPIC) {
    return await getAnthropicAnswer(question, choices, settings.apiKey);
  } else {
    throw new Error('Invalid AI provider selected');
  }
}

async function getOpenAIAnswer(question, choices, apiKey) {
  const prompt = `You are helping answer a Kahoot quiz question.

Question: ${question}

Answer choices:
${choices.map((choice, i) => `${i + 1}. ${choice}`).join('\n')}

Please analyze the question and provide ONLY the text of the correct answer choice (exactly as it appears in the choices above). Do not provide explanations, just the answer text.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers quiz questions. Always respond with just the answer text, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    console.log('OpenAI response:', answer);
    return answer;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

async function getAnthropicAnswer(question, choices, apiKey) {
  const prompt = `You are helping answer a Kahoot quiz question.

Question: ${question}

Answer choices:
${choices.map((choice, i) => `${i + 1}. ${choice}`).join('\n')}

Please analyze the question and provide ONLY the text of the correct answer choice (exactly as it appears in the choices above). Do not provide explanations, just the answer text.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    const answer = data.content[0].text.trim();

    console.log('Anthropic response:', answer);
    return answer;

  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}
