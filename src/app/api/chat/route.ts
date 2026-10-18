import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { aiTools, executeTool } from "@/lib/gemini";

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const parsed = messages.map((m) => {
      let toolCalls = null;
      try {
        if (m.toolCalls) toolCalls = JSON.parse(m.toolCalls);
      } catch {}
      return {
        ...m,
        toolCalls,
        createdAt: m.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ messages: parsed });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.chatMessage.deleteMany();
    const welcome = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content:
          "✨ История чата очищена. Я по-прежнему знаю всё о Лизе и ваших близких! Чем могу помочь?",
      },
    });

    return NextResponse.json({
      success: true,
      messages: [{ ...welcome, createdAt: welcome.createdAt.toISOString() }],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, customApiKey } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmedUserMsg = message.trim();

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        role: "user",
        content: trimmedUserMsg,
      },
    });

    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      "";

    if (!apiKey) {
      const fallbackReply = await prisma.chatMessage.create({
        data: {
          role: "assistant",
          content:
            "⚠️ **Ключ Gemini API не настроен.**\n\nПожалуйста, укажите ваш бесплатный ключ Google Gemini API в файле `.env` (`GEMINI_API_KEY=...`) или нажмите на значок ⚙️ (Настройки AI) в правом верхнем углу интерфейса.\n\nПолучить бесплатный ключ можно за 1 минуту на [Google AI Studio](https://aistudio.google.com/app/apikey).",
        },
      });

      return NextResponse.json({
        message: {
          ...fallbackReply,
          createdAt: fallbackReply.createdAt.toISOString(),
        },
        toolExecutions: [],
        updatedGraph: false,
      });
    }

    // Load full RAG context from database
    const [allPersons, allRelationships, recentHistory] = await Promise.all([
      prisma.person.findMany(),
      prisma.relationship.findMany({
        include: { source: true, target: true },
      }),
      prisma.chatMessage.findMany({
        orderBy: { createdAt: "asc" },
        take: 12,
      }),
    ]);

    const today = new Date();
    const todayFormatted = today.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format persons with their details & missing info analysis
    const missingInfoSummaries: string[] = [];
    const formattedPersons = allPersons.map((p) => {
      let hobbies: string[] = [];
      let preferences: string[] = [];
      try {
        hobbies = JSON.parse(p.hobbies || "[]");
      } catch {
        hobbies = p.hobbies ? [p.hobbies] : [];
      }
      try {
        preferences = JSON.parse(p.preferences || "[]");
      } catch {
        preferences = p.preferences ? [p.preferences] : [];
      }

      let birthFormatted = "Не указана";
      let daysUntilBirthday = "";
      if (p.birthDate) {
        const b = new Date(p.birthDate);
        birthFormatted = `${b.getDate().toString().padStart(2, "0")}.${(b.getMonth() + 1)
          .toString()
          .padStart(2, "0")}.${b.getFullYear()}`;

        // Compute upcoming days
        const nextBday = new Date(today.getFullYear(), b.getMonth(), b.getDate());
        if (nextBday < today) {
          nextBday.setFullYear(today.getFullYear() + 1);
        }
        const diffMs = nextBday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        daysUntilBirthday = ` (через ${diffDays} дн.)`;
      } else {
        missingInfoSummaries.push(`У ${p.name} не указана дата рождения`);
      }

      if (hobbies.length === 0) {
        missingInfoSummaries.push(`У ${p.name} не записаны увлечения`);
      }
      if (preferences.length === 0) {
        missingInfoSummaries.push(`У ${p.name} не записаны предпочтения и вкусы`);
      }

      return `- ID: "${p.id}" | ${p.name} [роль: ${p.relation}]
  • День рождения: ${birthFormatted}${daysUntilBirthday}
  • Хобби: ${hobbies.length ? hobbies.join(", ") : "—"}
  • Предпочтения/Вкусы/Подарки: ${preferences.length ? preferences.join(", ") : "—"}
  • Заметки: ${p.notes || "—"}`;
    });

    const formattedRelations = allRelationships.map(
      (r) => `- "${r.source.name}" ➔ "${r.target.name}" (связь: ${r.label})`
    );

    const systemPrompt = `Ты — чуткий, внимательный и высокоинтеллектуальный личный консьерж и помощник по отношениям, семье и подаркам.
Ты управляешь живой нейросетевой майнд-картой окружения пользователя.

Сегодняшняя дата: ${todayFormatted}.

ГЛАВНЫЙ ЦЕНТРАЛЬНЫЙ УЗЕЛ КАРТЫ:
Лиза — любимая девушка пользователя. Вокруг неё строится всё окружение и семья.

ТЕКУЩАЯ БАЗА ЗНАНИЙ (ЛЮДИ В ГРАФЕ):
${formattedPersons.join("\n\n")}

СВЯЗИ МЕЖДУ ЛЮДЬМИ:
${formattedRelations.join("\n")}

НЕДОСТАЮЩАЯ ИНФОРМАЦИЯ В КАРТЕ:
${missingInfoSummaries.length ? missingInfoSummaries.join("\n") : "Вся базовая информация заполнена."}

ТВОИ ЗАДАЧИ И ПРАВИЛА ПОВЕДЕНИЯ:
1. КОНСЬЕРЖ ПО ПОДАРКАМ И ОТНОШЕНИЯМ:
   - Если пользователь спрашивает, что подарить маме, Лизе, брату, папе и т.д., давай точные, душевные, оригинальные и практичные идеи на основе их реальных хобби, предпочтений и заметок.
   - Учитывай бюджет, если он указан (например, до 3000₽, до 10000₽).
   - Если пользователь спрашивает, кто празднует день рождения в ближайший месяц, сосчитай дни и подробно ответь, предложив идеи для поздравления.
2. ИНСТРУМЕНТЫ (FUNCTION CALLING) — КРИТИЧЕСКИ ВАЖНО:
   - Если пользователь в своём сообщении упоминает новый факт о ком-то (например: "брат любит рок и катается на сноуборде", "мама обожает пионы", "у папы размер ноги 43", "папа начал учить испанский"), ТЫ ОБЯЗАН ВЫЗВАТЬ инструмент \`update_person_info\` с \`person_id\` соответствующего человека!
   - Если пользователь говорит о новом человеке (например: "у Лизы есть коллега Анна, она дизайнер", "добавь дядю Мишу"), ТЫ ОБЯЗАН ВЫЗВАТЬ инструмент \`add_relative\`.
   - Не обещай обновить данные на словах — вызывай инструмент!
3. ПРОАКТИВНОСТЬ:
   - Если в карточке человека есть пробелы (нет хобби или дня рождения), ты можешь в самом конце своего ответа очень вежливо и ненавязчиво поинтересоваться:
     *"Кстати, а какие увлечения у папы Лизы? Могу сразу внести в карту."* или *"Кстати, когда день рождения у бабушки?"*
4. СТИЛЬ:
   - Тёплый, интеллигентный, заботливый тон, аккуратное форматирование в Markdown (жирный шрифт, списки, эмодзи).`;

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      tools: aiTools,
    });

    // Prepare previous history for the Gemini chat
    // Format history excluding the latest user message
    const historyForGemini = recentHistory.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chatSession = model.startChat({
      history: historyForGemini,
    });

    let result = await chatSession.sendMessage(trimmedUserMsg);
    let response = result.response;

    const toolExecutions: { name: string; args: any; result: string }[] = [];
    let updatedGraph = false;

    // Loop for handling Function Calls (up to 4 steps)
    let turns = 0;
    while (response.functionCalls() && response.functionCalls()!.length > 0 && turns < 4) {
      turns++;
      const calls = response.functionCalls()!;
      const functionResponses = [];

      for (const call of calls) {
        console.log(`[AI Tool Call] ${call.name} with args:`, call.args);
        const executionResult = await executeTool(call.name, call.args);
        updatedGraph = true;

        toolExecutions.push({
          name: call.name,
          args: call.args,
          result: JSON.stringify(executionResult),
        });

        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result: executionResult },
          },
        });
      }

      // Send tool results back to Gemini to complete response
      result = await chatSession.sendMessage(functionResponses);
      response = result.response;
    }

    const finalAnswer =
      response.text() ||
      "Готово! Я обновил данные в вашей интерактивной семейной карте.";

    // Save assistant response to DB
    const savedAssistantMsg = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: finalAnswer,
        toolCalls: toolExecutions.length ? JSON.stringify(toolExecutions) : null,
      },
    });

    return NextResponse.json({
      message: {
        ...savedAssistantMsg,
        toolCalls: toolExecutions.length ? toolExecutions : null,
        createdAt: savedAssistantMsg.createdAt.toISOString(),
      },
      toolExecutions,
      updatedGraph,
    });
  } catch (error: any) {
    console.error("Error in POST /api/chat:", error);

    // Save informative error message in chat so user sees what happened
    const errorText = error.message?.includes("API_KEY")
      ? "⚠️ Ошибка ключа API: ключ недействителен или не имеет доступа к Gemini API."
      : `⚠️ Произошла ошибка при обращении к ИИ: ${error.message || "Неизвестная ошибка"}`;

    const errRecord = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: errorText,
      },
    });

    return NextResponse.json({
      message: {
        ...errRecord,
        createdAt: errRecord.createdAt.toISOString(),
      },
      toolExecutions: [],
      updatedGraph: false,
    });
  }
}
