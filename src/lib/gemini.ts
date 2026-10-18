import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export const aiTools: { functionDeclarations: FunctionDeclaration[] }[] = [
  {
    functionDeclarations: [
      {
        name: "update_person_info",
        description:
          "Обновить или дополнить информацию о человеке в базе данных (увлечения, предпочтения, размер одежды, любимые цветы/подарки, заметки, дату рождения или имя). Вызывай этот инструмент, когда пользователь делится новыми фактами о ком-либо.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            person_id: {
              type: SchemaType.STRING,
              description: "Точный ID человека из базы данных (из переданного списка)",
            },
            name: {
              type: SchemaType.STRING,
              description: "Уточненное имя или обращение, если изменилось",
            },
            relation: {
              type: SchemaType.STRING,
              description: "Роль человека (мама, папа, брат, девушка, друг, коллега)",
            },
            birthDate: {
              type: SchemaType.STRING,
              description: "Дата рождения человека в формате ГГГГ-ММ-ДД (например 1999-07-15)",
            },
            add_hobbies: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Список новых увлечений и хобби для добавления к уже существующим",
            },
            add_preferences: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Список новых предпочтений (любимые цветы, блюда, напитки, размер одежды, антипатии, пожелания по подаркам)",
            },
            notes: {
              type: SchemaType.STRING,
              description: "Заметка или дополнение к заметкам о человеке",
            },
          },
          required: ["person_id"],
        },
      },
      {
        name: "add_relative",
        description:
          "Добавить нового человека (родственника, друга, коллегу) в граф связей и соединить его с существующим узлом (например, с Лизой или другим человеком).",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Имя нового человека (например: 'Алексей (дядя)', 'Катя (коллега)')",
            },
            relation: {
              type: SchemaType.STRING,
              description: "Роль / родство (дядя, подруга, коллега, дедушка, племянник)",
            },
            target_person_id: {
              type: SchemaType.STRING,
              description: "ID существующего человека в графе, с которым создается связь. Если не уточнен, использовать ID Лизы",
            },
            relationship_label: {
              type: SchemaType.STRING,
              description: "Подпись связи на линии (например 'дядя', 'подруга', 'коллега')",
            },
            birthDate: {
              type: SchemaType.STRING,
              description: "Дата рождения в формате ГГГГ-ММ-ДД (если известна)",
            },
            hobbies: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Список хобби и интересов нового человека",
            },
            preferences: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Список предпочтений, вкусов и пожеланий",
            },
            notes: {
              type: SchemaType.STRING,
              description: "Первичные заметки о новом человеке",
            },
          },
          required: ["name", "relation"],
        },
      },
    ],
  },
];

export async function executeTool(name: string, args: any) {
  try {
    if (name === "update_person_info") {
      const { person_id, name: newName, relation, birthDate, add_hobbies, add_preferences, notes } = args;

      const person = await prisma.person.findUnique({
        where: { id: person_id },
      });

      if (!person) {
        return { success: false, error: `Человек с ID ${person_id} не найден` };
      }

      let currentHobbies: string[] = [];
      let currentPreferences: string[] = [];

      try {
        currentHobbies = JSON.parse(person.hobbies || "[]");
      } catch {
        currentHobbies = person.hobbies ? [person.hobbies] : [];
      }

      try {
        currentPreferences = JSON.parse(person.preferences || "[]");
      } catch {
        currentPreferences = person.preferences ? [person.preferences] : [];
      }

      if (Array.isArray(add_hobbies)) {
        for (const h of add_hobbies) {
          const clean = h.trim();
          if (clean && !currentHobbies.includes(clean)) {
            currentHobbies.push(clean);
          }
        }
      }

      if (Array.isArray(add_preferences)) {
        for (const p of add_preferences) {
          const clean = p.trim();
          if (clean && !currentPreferences.includes(clean)) {
            currentPreferences.push(clean);
          }
        }
      }

      let updatedNotes = person.notes || "";
      if (notes && notes.trim()) {
        if (updatedNotes) {
          updatedNotes = `${updatedNotes}\n• ${notes.trim()}`;
        } else {
          updatedNotes = notes.trim();
        }
      }

      const updated = await prisma.person.update({
        where: { id: person_id },
        data: {
          ...(newName && { name: newName.trim() }),
          ...(relation && { relation: relation.trim() }),
          ...(birthDate && { birthDate: new Date(birthDate) }),
          hobbies: JSON.stringify(currentHobbies),
          preferences: JSON.stringify(currentPreferences),
          notes: updatedNotes || null,
        },
      });

      return {
        success: true,
        message: `Успешно обновлена карточка: ${updated.name}`,
        person: {
          id: updated.id,
          name: updated.name,
          hobbies: currentHobbies,
          preferences: currentPreferences,
          notes: updated.notes,
        },
      };
    }

    if (name === "add_relative") {
      const {
        name: personName,
        relation,
        target_person_id,
        relationship_label,
        birthDate,
        hobbies,
        preferences,
        notes,
      } = args;

      const hobbiesList = Array.isArray(hobbies) ? hobbies.filter(Boolean) : [];
      const preferencesList = Array.isArray(preferences) ? preferences.filter(Boolean) : [];

      const newPerson = await prisma.person.create({
        data: {
          name: personName.trim(),
          relation: relation.trim(),
          birthDate: birthDate ? new Date(birthDate) : null,
          hobbies: JSON.stringify(hobbiesList),
          preferences: JSON.stringify(preferencesList),
          notes: notes?.trim() || null,
        },
      });

      // Target person to connect
      let targetId = target_person_id;
      if (!targetId) {
        // Find Liza or central person
        const liza = await prisma.person.findFirst({
          where: { relation: { contains: "девушка" } },
        });
        targetId = liza?.id;
      }

      let relationshipCreated = null;
      if (targetId) {
        relationshipCreated = await prisma.relationship.create({
          data: {
            sourceId: newPerson.id,
            targetId: targetId,
            label: relationship_label || relation,
          },
        });
      }

      return {
        success: true,
        message: `Создан новый человек "${newPerson.name}" (${relation}) и добавлена связь в граф связей`,
        personId: newPerson.id,
        relationship: relationshipCreated,
      };
    }

    return { success: false, error: `Неизвестная функция: ${name}` };
  } catch (error: any) {
    console.error("Error executing tool:", name, error);
    return { success: false, error: error.message };
  }
}
