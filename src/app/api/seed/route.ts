import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.relationship.deleteMany();
    await prisma.person.deleteMany();
    await prisma.chatMessage.deleteMany();

    const liza = await prisma.person.create({
      data: {
        name: "Лиза (моя девушка)",
        relation: "девушка",
        birthDate: new Date("1999-07-15T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "живопись",
          "йога",
          "пленочная фотография",
          "путешествия",
          "французский язык",
        ]),
        preferences: JSON.stringify([
          "любит белые пионы и эустомы",
          "матча-латте на кокосовом молоке",
          "не пьет кофе",
          "размер одежды S (верх) / 26 (джинсы)",
          "обожает свечи с ароматом инжира и базилика",
          "серебряные украшения минимализм",
        ]),
        notes:
          "Центр нашей вселенной. Мечтает весной поехать в Киото во время цветения сакуры. Любит атмосферные вечерние прогулки.",
      },
    });

    const mama = await prisma.person.create({
      data: {
        name: "Ирина (мама)",
        relation: "мама",
        birthDate: new Date("1974-05-20T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "кулинария",
          "садоводство",
          "скандинавская ходьба",
          "театр",
          "дизайн интерьеров",
        ]),
        preferences: JSON.stringify([
          "любит гортензии и пионовидные тюльпаны",
          "зеленый чай с жасмином",
          "уютные кашемировые пледы",
          "авторская керамическая посуда",
        ]),
        notes:
          "День рождения 20 мая. Обожает собирать всю семью за большим столом на даче. Печет потрясающий черничный пирог.",
      },
    });

    const papa = await prisma.person.create({
      data: {
        name: "Андрей (папа)",
        relation: "папа",
        birthDate: new Date("1972-11-12T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "рыбалка",
          "автомобили",
          "барбекю и гриль",
          "исторические книги",
          "шахматы",
        ]),
        preferences: JSON.stringify([
          "свежеобжаренный зерновой кофе",
          "качественные инструменты (Makita, Bosch)",
          "горький шоколад 85%",
          "термокружки Stanley",
        ]),
        notes:
          "Мастер на все руки. Всегда выручит с машиной и ремонтом. Присматривает новый спиннинг на хищника к осеннему сезону.",
      },
    });

    const brat = await prisma.person.create({
      data: {
        name: "Максим (брат)",
        relation: "брат",
        birthDate: new Date("2003-09-08T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "рок-музыка",
          "электрогитара",
          "сноуборд",
          "киберспорт (Dota 2, CS:GO)",
          "хайкинг",
        ]),
        preferences: JSON.stringify([
          "оверсайз худи размера L",
          "мерч рок-групп (Linkin Park, Radiohead)",
          "беспроводные игровые наушники",
          "энергетики без сахара (манго/гуава)",
        ]),
        notes:
          "Студент факультета ИТ. Играет в гаражной группе. Копит на новую гитарную педаль эффектов Overdrive.",
      },
    });

    const babushka = await prisma.person.create({
      data: {
        name: "Валентина Ивановна (бабушка)",
        relation: "бабушка",
        birthDate: new Date("1950-03-02T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "вязание спицами",
          "домашняя выпечка",
          "классическая литература",
          "разведение комнатных фиалок",
        ]),
        preferences: JSON.stringify([
          "павловопосадские платки с узорами",
          "травяные чаи (чабрец, мелисса, шиповник)",
          "ортопедическая подушка для сна",
          "натуральный мед",
        ]),
        notes:
          "Золотой человек. Вяжет самые теплые носочки. Главное правило: никто не должен уйти голодным!",
      },
    });

    const artem = await prisma.person.create({
      data: {
        name: "Артём (друг семьи)",
        relation: "друг",
        birthDate: new Date("1998-12-04T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "настольные игры",
          "горный туризм",
          "подкасты про стартапы и AI",
          "бег на 10 км",
        ]),
        preferences: JSON.stringify([
          "сложные стратегические настолки (Покорение Марса)",
          "крафтовый кофе specialty",
          "спортивная экипировка",
        ]),
        notes:
          "Верный друг, знакомы больше 10 лет. Каждую осень организует вылазки с палатками в горы.",
      },
    });

    const sofia = await prisma.person.create({
      data: {
        name: "София (сестра Лизы)",
        relation: "сестра",
        birthDate: new Date("2007-04-18T00:00:00.000Z"),
        hobbies: JSON.stringify([
          "аниме и манга",
          "скетчинг и цифровая иллюстрация",
          "K-Pop (Stray Kids)",
          "скейтборд",
        ]),
        preferences: JSON.stringify([
          "японские сладости (моти, поки)",
          "скетчбуки с плотной бумагой маркеров",
          "аксессуары в пастельных тонах",
        ]),
        notes:
          "Младшая сестра Лизы. Талантливо рисует персонажей. Готовится поступать в академию искусств.",
      },
    });

    const relationsData = [
      { sourceId: mama.id, targetId: liza.id, label: "мама" },
      { sourceId: papa.id, targetId: liza.id, label: "папа" },
      { sourceId: brat.id, targetId: liza.id, label: "брат" },
      { sourceId: sofia.id, targetId: liza.id, label: "сестра" },
      { sourceId: babushka.id, targetId: liza.id, label: "бабушка" },
      { sourceId: artem.id, targetId: liza.id, label: "друг семьи" },
      { sourceId: papa.id, targetId: mama.id, label: "муж и жена" },
      { sourceId: mama.id, targetId: brat.id, label: "мама" },
      { sourceId: papa.id, targetId: brat.id, label: "папа" },
      { sourceId: mama.id, targetId: sofia.id, label: "мама" },
      { sourceId: papa.id, targetId: sofia.id, label: "папа" },
      { sourceId: babushka.id, targetId: mama.id, label: "мама" },
      { sourceId: brat.id, targetId: artem.id, label: "приятели" },
    ];

    for (const rel of relationsData) {
      await prisma.relationship.create({ data: rel });
    }

    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content:
          "👋 Привет! Я твой персональный AI-консьерж по близким и семье.\n\nВ центре нашей нейрокарты — **Лиза**, а вокруг неё построены связи со всеми родными. Я знаю их хобби, вкусы и дни рождения. Спроси меня, что подарить, или просто расскажи новый факт (например, *«Папа начал учиться играть на укулеле»*), и я сразу обновлю карту!",
      },
    });

    return NextResponse.json({ success: true, message: "Database reseeded successfully" });
  } catch (error: any) {
    console.error("Error reseeding:", error);
    return NextResponse.json({ error: "Failed to reseed database" }, { status: 500 });
  }
}
