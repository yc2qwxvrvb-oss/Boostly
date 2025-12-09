const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { product, category } = req.body || {};
    if (!product || !product.trim()) return res.status(400).json({ error: 'product required' });

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: 'OpenAI key not configured' });

    const prompt = `
أنت خبير إعلانات محترف ونسق فخم. اعتمد الفئة: ${category || 'عام'}.
اكتب محتوى تسويقي كامل لاسم المنتج: ${product}.
المطلوب: عنوان قوي جداً، مشكلة شائعة، الألم، الحل، ضمان، CTA قوي لا يقاوم، منشور إنستغرام جذاب، وإعلان واتساب قصير.
اكتب بالعربية الفصحى التسويقية، بدون أخطاء إملائية. كن محترفاً جداً.
    `;

    const payload = {
      model: "gpt-4",
      messages: [
        { role: "system", content: "أنت كاتب إعلاني خبير، اكتب باحترافية وتسويق." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ success: true, text });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
