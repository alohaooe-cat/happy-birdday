import type { BirdType, Flock, QuizQuestion } from '../types'

export const siteContent = {
  event: {
    title: 'HAPPY BIRDDAY',
    birthdayDate: '26 августа',
    eventDate: '29 августа',
    year: '2026',
    // Цель обратного отсчёта на обложке. Меняй дату здесь.
    countdownTarget: '2026-08-29T08:00:00+03:00',
    coverLine: '29 августа · суббота',
    coverScrollCue: 'Снижаемся',
    countdownLabel: 'До слёта',
    countdownDone: 'Слёт начался',
  },
  intro: {
    title: 'Тест: какая ты птица?',
    text: '__26 августа__ у птахи ~Тани~ день рождения, а **29 августа** ожидается редкое природное явление: массовое скопление разнопёрых птиц в районе Кронштадта. Наблюдения показывают, что разные виды прилетают в разное время и разными путями. Ответь на несколько вопросов, чтобы определить свой маршрут на этот день. Метод не признан орнитологами, но это их проблемы.',
    button: 'Пройти тест',
  },
  questions: [
    {
      id: 'six-am',
      prompt: 'Кто-то говорит тебе «доброе утро» в 6:00. Ты:',
      answers: [
        { id: 'smile', label: 'Отвечаешь тем же с улыбкой на лице, сладко потягиваясь', score: 1 },
        { id: 'five-more', label: 'Просишь ещё 5 минуточек', score: 0 },
        { id: 'aggression', label: 'Воспринимаешь это как акт агрессии и бросаешься злобными взглядами', score: -1 },
      ],
    },
    {
      id: 'proverb',
      prompt: 'Какая пословица тебе ближе?',
      answers: [
        { id: 'work-wolf', label: '«Работа не волк, в лес не убежит»', score: -1 },
        { id: 'vegetable-time', label: '«Всякому овощу своё время»', score: 0 },
        { id: 'early-bird', label: '«Кто рано встаёт, тому Бог подаёт»', score: 1 },
      ],
    },
    {
      id: 'profession',
      prompt: 'Какая профессия тебе кажется наиболее романтичной?',
      answers: [
        { id: 'ornithologist', label: 'Орнитолог', score: 1 },
        { id: 'stargazer', label: 'Звездочёт', score: -1 },
        { id: 'botanical-illustrator', label: 'Ботанический иллюстратор', score: 0 },
      ],
    },
    {
      id: 'three-forty',
      prompt: 'Незнакомый человек подсел к тебе и сказал: «Я знаю, чем ты занимался\u2060/\u2060лась в 03:40». Твоя первая мысль:',
      answers: [
        { id: 'which-day', label: '«Он имеет в виду вчера или две недели назад?»', score: 0 },
        { id: 'asleep', label: '«Он адекватный? Конечно, спал\u2060/\u2060а»', score: 1 },
        { id: 'psychics', label: '«Как он узнал, что я смотрел\u2060/\u2060а “Битву экстрасенсов”?»', score: -1 },
      ],
    },
    {
      id: 'bird-outfit',
      prompt: 'В магазине птичьих нарядов есть три вещи, и денег хватит только на одну. Что выберешь?',
      answers: [
        { id: 'collar', label: 'Аккуратный воротник из перьев. Идёт ко всему, пригодится потом', score: 1 },
        { id: 'beak-mask', label: 'Маску с клювом. Лицо закрыто, зато сразу понятно, что за птица', score: 0 },
        { id: 'giant-fan', label: 'Метровый веер из перьев. Неудобно, зато незабываемо', score: -1 },
      ],
    },
    {
      id: 'kitchen-note',
      prompt: 'На кухне лежит записка от тебя. Что там написано?',
      answers: [
        { id: 'beans', label: '«Не забудь замочить фасоль». Написано вчера, аккуратным почерком', score: 1 },
        { id: 'million-idea', label: '«Идея на миллион». Дальше нечитаемо', score: -1 },
        { id: 'buy-everything', label: '«Купить всё». Не помню, что имелось в виду', score: 0 },
      ],
    },
    {
      id: 'useless-skill',
      prompt: 'Выбери себе одно бесполезное умение.',
      answers: [
        { id: 'language-overnight', label: 'Выучивать за ночь новый язык и забывать после сна', score: -1 },
        { id: 'left-key', label: 'Всегда попадать ключом в замок с первого раза, но только левой рукой', score: 0 },
        { id: 'before-alarm', label: 'Просыпаться ровно за минуту до будильника', score: 1 },
      ],
    },
  ] satisfies QuizQuestion[],
  results: {
    lark: {
      title: 'Жаворонок',
      description: 'Ты из тех редких птиц, которые способны не просто проснуться к восьми, но и добровольно куда-то к этому времени прилететь. Ты успеваешь прожить полдня до того, как остальные выпьют свою первую чашку кофе. Твой маршрут начинается с прогулки с орнитологом и наблюдения за настоящими птицами. Дальше день пойдёт своим ходом, но лучшая его часть уже будет принадлежать тебе.',
      defaultRoute: 'lark',
      recommendationText: 'Жаворонки прилетают первыми и не считают это подвигом. Другие птицы, ради которых они слетаются, в этот час тоже уже на ногах.',
    },
    pigeon: {
      title: 'Голубь',
      description: 'Ты — городская птица широкого профиля. Можешь оказаться на месте в удивительно ранний час, но только если обстоятельства достаточно убедительны. В тебе мирно уживаются желание ничего не пропустить и талант появляться именно тогда, когда начинается самое интересное. Тест оставил тебе оба варианта: отправиться на утреннюю прогулку или эффектно приземлиться позже. При любом выборе будет казаться, что именно так всё и было задумано.',
      defaultRoute: 'pigeon',
      recommendationText: 'Голуби отлично ориентируются по ситуации. Ты разберёшься, когда взлетать и где приземляться.',
    },
    owl: {
      title: 'Сова',
      description: 'Некоторые птицы не торопятся появляться перед публикой — и правильно делают. Ты предпочитаешь не спорить со своими внутренними часами и прилетаешь тогда, когда тебе действительно удобно. Твой маршрут позволяет спокойно пропустить раннюю прогулку и присоединиться к стае позже. Никакой погони за жаворонками: ты появишься в своём ритме и всё равно окажешься в центре событий.',
      defaultRoute: 'owl',
      recommendationText: 'Утро можно провести без подвигов. К стае ты присоединишься уже в рабочем совином состоянии.',
    },
  } satisfies Record<BirdType, { title: string; description: string; defaultRoute: Flock; recommendationText: string }>,
  routes: {
    lark: {
      label: 'Ранний вылет',
      items: [
        'Самый экстремально ранний маршрут',
        '3-4 часа блужданий и наблюдений за птицами с *Ричардом*',
        'Максимальное количество впечатлений',
      ],
    },
    pigeon: {
      label: 'Свободный городской',
      items: [
        'Можно примкнуть к жаворонкам и *Ричарду* в их экстремально ранней прогулке',
        'А можно дать себе поспать и прилететь с совами',
        'Определись в перекличке ниже',
      ],
    },
    owl: {
      label: 'Отложенный вылет',
      items: [
        'Утро можно проспать без угрызений совести',
        'Время прилёта — на твой выбор',
        'Где в этот момент стая, уточняй в Диспетчерской (ТГ)',
      ],
    },
  } satisfies Record<BirdType, { label: string; items: string[] }>,
  dayPlan: [
    {
      time: '08:00',
      title: 'Прогулка с орнитологом',
      text: 'Встречаемся на автобусной остановке «Караул». Прогулка займёт 3–4 часа. Рядом предусмотрено место, где можно оставить машины.',
      links: [
        {
          label: 'Где оставить машину',
          url: 'https://yandex.ru/maps?whatshere%5Bpoint%5D=29.71283016392885%2C60.015880719051395&whatshere%5Bzoom%5D=18.295376&ll=29.71283016392885%2C60.015880718690404&z=18.295376&si=m9n8hhkd7pem6tjgc6066c5h8w',
        },
        {
          label: 'Место встречи — остановка «Караул»',
          url: 'https://yandex.ru/maps/org/karaul/113956074437?si=m9n8hhkd7pem6tjgc6066c5h8w',
        },
      ],
    },
    {
      title: 'Пикник на пляже',
      text: 'Если погода позволяет, отдыхаем на пляже, катаемся на сапах и всячески чиллим. Закуски для общего стола только приветствуются. Пляж на территории заказника «Западный Котлин», поэтому мангалы нельзя, но если очень аккуратно, то можно. Ориентируемся часа на два-три, но решаем по ситуации.',
    },
    {
      title: 'Новоселье',
      text: 'Едем в квартиру в Кронштадте, осматриваем свежий ремонт и снова чиллим.',
      links: [
        {
          label: 'Зосимова, 4',
          url: 'https://yandex.ru/maps?text=60.000479,29.762687&si=v2rbn101wx39hutyed13envh98',
        },
      ],
    },
    {
      title: 'Прогулка по городу',
      text: 'Идём гулять по Кронштадту и гадить на памятники.',
    },
    {
      title: 'Продолжение вечеринки',
      text: 'Либо остаёмся в квартире в Кронштадте, либо едем в основную квартиру. Если играешь на музыкальном инструменте — бери его с собой, будем музицировать.',
      links: [
        {
          label: 'Королёва, 64к1',
          url: 'https://yandex.ru/maps?text=60.033567,30.237652&si=v2rbn101wx39hutyed13envh98',
        },
      ],
    },
  ],
  weatherScenarios: [
    {
      id: 'ideal',
      icon: 'sun',
      title: 'Солнечно, облачно, слабо дождечно',
      status: 'ready',
      items: [
        'В 08:00 идём на прогулку',
        'Если погода позволяет, после идём на пляж',
        'Едем в Кронштадское гнездо, устраиваем новоселье',
        'Гуляем по Кронштадту',
        'Продолжаем вечеринку в Кронштадте или едем в гнездо на Королёва',
      ],
    },
    {
      id: 'rainy-morning',
      icon: 'storm',
      title: 'Дождина, смерч, апокалипсис',
      status: 'ready',
      items: [
        'Импровизируем: прогулка с орнитологом отменяется и, скорее всего, переносится на следующий день (обговариваемо)',
        'Если погода улучшается, встречаемся в квартире в Кронштадте, немного тусим и гуляем',
        'После смотрим по ситуации: остаёмся в Кронштадте или едем на проспект Королёва, 64к1',
        'Если погода плохая весь день, снимаем студию, фоткаемся, дурачимся, затем едем на Королёва',
        'Новоселье при плохой погоде весь день переносится',
      ],
    },
  ],
  walkClothing: {
    title: 'Как одеться на прогулку',
    text: 'Скорее всего, утром будет прохладно, ветрено и дождливо. Лучше одеться слоями, выбрать непродуваемую и непромокаемую верхнюю одежду, а главное — обувь, в которой ноги останутся сухими. Дождевик и запасные носки тоже пригодятся.',
  },
  dressCode: {
    title: 'Оперение',
    text: 'Приходи так, как тебе комфортно, но будет очень круто, если ты поддержишь птичью тематику: добавишь перья, аксессуар или соберёшь целый образ. Будут классные фотки!',
    inspirationText: 'Ниже — несколько картинок для вдохновения',
  },
  products: [
    { id: 'bird-mask', name: 'Маска птицы', category: 'Маска с клювом', url: 'https://ali.click/iwm1j13', image: '/products/bird-mask.jpg', imageWidth: 800, imageHeight: 800, accent: 'coral' },
    { id: 'eagle-mask', name: 'Маска орла с перьями', category: 'Маска', url: 'https://ali.click/txm1j1x', image: '/products/eagle-mask.webp', imageWidth: 640, imageHeight: 640, accent: 'blue' },
    { id: 'crow-beak-mask', name: 'Маска-клюв вороны', category: 'Маска', url: 'https://ali.click/cym1j1j', image: '/products/crow-beak-mask.webp', imageWidth: 640, imageHeight: 640, accent: 'lime' },
    { id: 'raven-mask', name: 'Маска ворона', category: 'Маска', url: 'https://ali.click/3zm1j1d', image: '/products/raven-mask.webp', imageWidth: 640, imageHeight: 640, accent: 'violet' },
    { id: 'feather-cuffs', name: 'Манжеты с перьями', category: 'На руки', url: 'https://ali.click/yzm1j1w', image: '/products/feather-cuffs.webp', imageWidth: 640, imageHeight: 640, accent: 'coral' },
    { id: 'feather-top', name: 'Кроп-топ с перьями', category: 'Одежда', url: 'https://ali.click/j0n1j1o', image: '/products/feather-top.webp', imageWidth: 640, imageHeight: 640, accent: 'blue' },
    { id: 'feather-skirt', name: 'Юбка с перьями', category: 'Одежда', url: 'https://ali.click/d1n1j1c', image: '/products/feather-skirt.webp', imageWidth: 640, imageHeight: 640, accent: 'lime' },
    { id: 'wing-hairclips', name: 'Заколки-крылья', category: 'Для волос', url: 'https://ali.click/r3n1j10', image: '/products/wing-hairclips.webp', imageWidth: 480, imageHeight: 480, accent: 'violet' },
    { id: 'plush-wings', name: 'Плюшевые крылья', category: 'Крылья', url: 'https://ali.click/d5n1j1l', image: '/products/plush-wings.webp', imageWidth: 640, imageHeight: 640, accent: 'coral' },
    { id: 'pink-feather-boa', name: 'Боа из перьев', category: 'На шею', url: 'https://ali.click/j8n1j1q', image: '/products/pink-feather-boa.webp', imageWidth: 640, imageHeight: 640, accent: 'blue' },
    { id: 'red-feather-trim', name: 'Красная лента из перьев', category: 'Для своего образа', url: 'https://ali.click/3an1j1m', image: '/products/red-feather-trim.webp', imageWidth: 640, imageHeight: 640, accent: 'lime' },
    { id: 'bird-print-pants', name: 'Штаны с птичьим принтом', category: 'Одежда', url: 'https://ali.click/afn1j13', image: '/products/bird-print-pants.webp', imageWidth: 480, imageHeight: 640, accent: 'violet' },
    { id: 'feather-headband', name: 'Повязка с перьями', category: 'Для головы', url: 'https://ali.click/ysn1j1h', image: '/products/feather-headband.webp', imageWidth: 640, imageHeight: 640, accent: 'coral' },
    { id: 'retro-headband', name: 'Ретро-повязка для волос', category: 'Для головы', url: 'https://ali.click/2un1j1x', image: '/products/retro-headband.webp', imageWidth: 640, imageHeight: 640, accent: 'blue' },
    { id: 'chicken-socks', name: 'Гольфы с куриными лапами', category: 'Для ног', url: 'https://ozon.ru/t/AxpXujY', image: '/products/chicken-socks.webp', imageWidth: 820, imageHeight: 1001, accent: 'lime' },
    { id: 'ostrich-fan', name: 'Веер из страусиных перьев', category: 'В руки', url: 'https://ali.click/lninj17', image: '/products/ostrich-fan.webp', imageWidth: 700, imageHeight: 693, accent: 'coral' },
  ],
  gifts: {
    title: 'Подарки',
    text: 'Если подарочное вдохновение не прилетело, здесь можно подглядеть в хотелки.',
    instructions: [
      'Выбери подарок в Oh My Wishes',
      'Забронируй его',
      'Другие гости увидят, что подарок занят',
      'Для Тани выбор останется сюрпризом',
    ],
    wishlistUrl: 'https://ohmywishes.com/users/alohaooe/lists/1f6a768fcaf08f8707932546',
  },
  confirmation: {
    eyebrow: 'Перекличка',
    title: 'Подтверди маршрут',
    lead: 'Теперь у тебя есть весь план. Тест определил твою внутреннюю птаху, но будильник за тебя не поставит. Так что когда тебя ждать?',
    options: [
      { value: 'walk', label: 'Хочу на прогулку с орнитологом в\u00a008:00', hint: 'Ранний вылет' },
      { value: 'later', label: 'Присоединюсь к празднику позже', hint: 'Свободный вылет' },
      { value: 'no', label: 'В этот раз прилететь не смогу', hint: 'Остаюсь в гнезде' },
    ],
    panelSticker: 'Лётный лист',
    dressPledgeLabel: 'Поддержу пернатый дресс-код',
    dressPledgeHint: 'Перо, аксессуар или целый образ — на твой выбор.',
    dressPledgeError: 'Ну пожааааааалуйста Т_Т',
    partyLabel: 'Сколько птиц прилетит вместе с тобой?',
    partyHint: 'Считаем тебя и тех, кто не проходил тест.',
    messageLabel: 'Хочешь что-нибудь добавить?',
    messageHint: 'Необязательно, но вдруг тебе есть, что сказать!',
    savedNo: 'Эх, жаль(  Если планы изменятся — дай знать!',
    messagePlaceholder: 'Вот прямо тут',
    submit: 'Отметиться в стае',
    saving: 'Отмечаем…',
    savedTitle: 'Ты в списке',
  },
  // Подписи интерфейса. {name}, {n}, {total}, {bird}, {count} подставляются автоматически.
  ui: {
    skipLink: 'Перейти к содержанию',
    wordmarkBadge: '32',
    mastheadIssue: 'Полевой выпуск № 08/29',
    navStart: 'Определить маршрут',
    navConfirm: 'Отметиться в стае',
    heroAlt: 'Компания нарядных птиц собирается на праздник',
    // подпись от руки на белом поле открытки
    coverCardCaption: 'бал перелётных птиц',
    // тумблер фоновой записи птичьих голосов (public/bird-song.mp3)
    soundPlay: 'Включить голоса птиц',
    soundPause: 'Выключить голоса птиц',
    soundLabel: 'чирик-чирик',
    marquee: ['29 августа', 'Кронштадт', 'разнопёрый слёт', 'happy birdday'],
    introEyebrow: 'Предварительное наблюдение',
    introReturn: 'Показать мой результат',
    quiz: {
      progress: 'Вопрос {n} из {total}',
      back: 'Назад',
      next: 'Дальше',
      finish: 'Завершить',
    },
    name: {
      eyebrow: 'Наблюдение завершено',
      title: 'Как тебя зовут?',
      hint: 'Впишем тебя в красную книгу',
      label: 'Имя гостя',
      placeholder: 'Например, какапо Дмитрий',
      back: 'К вопросам',
      submit: 'Узнать результат',
    },
    result: {
      eyebrow: '{name}, наблюдение завершено',
      title: 'Ты — {bird}',
      recommended: 'Рекомендованный маршрут',
      keptOriginal: 'Исходный результат теста сохранён.',
      planEyebrow: 'Ключевые особенности маршрута',
      guideNote: '*Ричард* — наш гид-орнитолог',
    },
    dayPlan: {
      eyebrow: 'Глобальный маршрут',
      title: 'План дня',
    },
    weather: {
      eyebrow: 'Полевые условия',
      titleTop: 'Погода меняется.',
      titleBottom: 'Стая адаптируется.',
      walkEyebrow: 'Для утреннего маршрута',
    },
    dressEyebrow: 'Дресс-код',
    giftsEyebrow: 'Необязательная миграция средств',
    giftsButton: 'Открыть вишлист',
    saved: {
      declinedTitle: 'Ответ записан',
      walk: 'Прогулка с орнитологом подтверждена · {count}',
      later: 'Прилетаешь позже, без утренней прогулки',
    },
    notices: {
      walkConfirmed: 'Участие в прогулке с орнитологом подтверждено.',
      walkSkipped: 'Маршрут без утренней прогулки сохранён.',
      declined: 'Записали: в этот раз без тебя(',
      restarted: 'Прошлый результат перезапишется',
    },
    save: {
      sending: 'Отправляем обновление…',
      success: 'Сохранено на устройстве и отправлено в список гостей.',
      error: 'На устройстве сохранено. Отправить в список гостей пока не получилось.',
      retry: 'Повторить отправку',
      demo: 'Ответ сохранён на этом устройстве.',
    },
    finale: {
      topline: 'До встречи 29 августа',
      routeLabel: 'Твой маршрут',
      routeDeclined: 'В этот раз без тебя',
      walkLabel: 'Прогулка с орнитологом',
      walkConfirmed: 'Подтверждена · {count}',
      walkLater: 'Без утренней прогулки',
      walkDeclined: 'Не в этот раз',
      walkPending: 'Нужно подтвердить',
      note: 'План есть, а последние детали уточним ближе к дате. Главное — прилетай!',
      noteDeclined: 'Жаль, что не в этот раз. Планы меняются, возвращайся и поменяй ответ.',
      editRoute: 'Изменить маршрут',
      restart: 'Пройти тест заново',
      invitation: 'Ждём тебя, {name}!',
      invitationDeclined: 'Будем скучать, {name}!',
    },
  },
} as const
