import Groq from 'groq-sdk'

const SYSTEM_PROMPT = `You are a task formulation assistant. The user gives raw text (a rough idea, wish, or brief description of a task).

Your job: expand and detail the task based on the user's input. The task can be anything — cooking, learning, work, hobby, etc. Adapt the level of detail to the task type:
- For cooking: include main ingredients, steps, cooking time, serving suggestions.
- For learning: include topics, resources, success criteria, time estimate.
- For work/projects: include deliverables, acceptance criteria, context.
- For other tasks: break down into concrete steps, add context and completion criteria.

Output format: exactly one JSON object, no markdown, no comments:
{"title": "clear concise task title", "description": "detailed description with specific steps, context, and criteria. 2-5 sentences or bullet points. Be concrete, not generic."}

Write the title and description in Ukrainian.

If the user input is empty, return {"title": "", "description": ""}.`

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title?: string; description?: string }>(event)
  const title = (body?.title ?? '').trim()
  const description = (body?.description ?? '').trim()
  const config = useRuntimeConfig()
  const apiKey =
    config.groqApiKey ||
    process.env.GROQ_API_KEY ||
    process.env.NUXT_GROQ_API_KEY ||
    ''
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'GROQ_API_KEY не налаштовано'
    })
  }

  const groq = new Groq({ apiKey })
  const userContent =
    [title, description].filter(Boolean).join('\n\n') || 'Empty input — return empty title and description.'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ],
    temperature: 0.3,
    max_tokens: 768,
    response_format: { type: 'json_object' }
  })

  const raw = completion.choices[0]?.message?.content?.trim() ?? ''
  let result: { title: string; description: string }
  try {
    let jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const match = jsonStr.match(/\{[\s\S]*\}/)
    if (match) jsonStr = match[0]
    result = JSON.parse(jsonStr) as { title: string; description: string }
  } catch {
    throw createError({
      statusCode: 502,
      message: 'AI повернув невалідний JSON. Спробуйте ще раз.'
    })
  }

  return {
    title: typeof result.title === 'string' ? result.title : '',
    description: typeof result.description === 'string' ? result.description : ''
  }
})
