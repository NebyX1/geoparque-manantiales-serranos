export function initEducation(c) {
  const questions = [
    {
      q: '¿Qué historia cuentan las rocas de Arequita?',
      options: [
        'Un episodio de volcanismo.',
        'Un arrecife de coral actual.',
        'Una construcción humana.',
      ],
      correct: 0,
      text: 'La riolita de Arequita es una roca volcánica asociada a un episodio de alrededor de 130 millones de años.',
    },
    {
      q: 'Para cuidar un manantial, ¿alcanza con cuidar la fuente visible?',
      options: [
        'Sí, el agua se forma en la fuente.',
        'No: importa también el territorio que lo alimenta.',
        'Sólo importa el color del agua.',
      ],
      correct: 1,
      text: 'El agua tiene un recorrido previo por el terreno. Manantiales, infiltración, fracturas y acuíferos forman parte de un mismo sistema.',
    },
    {
      q: '¿Qué reúne un geoparque?',
      options: [
        'Solamente rocas y canteras.',
        'Patrimonio geológico, naturaleza y comunidades.',
        'Únicamente parques con entrada libre.',
      ],
      correct: 1,
      text: 'El Geoparque conecta la historia de la Tierra con la biodiversidad, la cultura y las comunidades que habitan el territorio.',
    },
    {
      q: '¿Qué hacer antes de ir a una cantera o sitio de investigación?',
      options: [
        'Seguir cualquier punto de un mapa.',
        'Retirar una piedra como recuerdo.',
        'Consultar al responsable y obtener autorización.',
      ],
      correct: 2,
      text: 'Lugares como Mina Verdún y Cueva Amarilla requieren autorización y condiciones específicas de visita.',
    },
    {
      q: '¿Qué hace especial una salida de geoeducación?',
      options: [
        'Aprender a observar y relacionar paisaje, vida y comunidad.',
        'Memorizar todos los nombres antes de salir.',
        'Encontrar un fósil para llevarse.',
      ],
      correct: 0,
      text: '«Una escuela, un geositio» conecta escuelas rurales, comunidades y conocimiento del territorio.',
    },
  ];
  let quizIndex = 0,
    quizScore = 0,
    answered = false;
  function renderQuiz() {
    if (quizIndex >= questions.length) {
      c.$('#quiz-content').innerHTML =
        `<div class="trip-empty">${c.icon('leaf')}<h3>Ahora el paisaje cuenta algo más.</h3><p>Respondiste correctamente ${quizScore} de ${questions.length} preguntas. Seguí explorando las historias del agua, las rocas y las comunidades.</p><button class="btn" data-action="quiz-restart">Volver a jugar ${c.icon('reset')}</button></div>`;
      return;
    }
    const q = questions[quizIndex];
    answered = false;
    c.$('#quiz-content').innerHTML =
      `<div class="quiz-card"><div class="eyebrow">Pregunta ${quizIndex + 1} de 5</div><div class="quiz-progress"><span style="width:${(quizIndex / 5) * 100}%"></span></div><h3>${c.esc(q.q)}</h3><div class="quiz-options">${q.options.map((text, i) => `<button data-answer="${i}">${c.esc(text)}</button>`).join('')}</div><div id="quiz-feedback" aria-live="polite"></div></div>`;
  }
  function answerQuiz(index) {
    if (answered) return;
    answered = true;
    const q = questions[quizIndex];
    if (index === q.correct) quizScore++;
    c.$$('[data-answer]').forEach((btn) => {
      const n = Number(btn.dataset.answer);
      btn.disabled = true;
      if (n === q.correct) btn.classList.add('correct');
      else if (n === index) btn.classList.add('incorrect');
    });
    c.$('#quiz-feedback').innerHTML =
      `<div class="quiz-feedback"><strong>${index === q.correct ? '¡Eso es!' : 'La respuesta nos abre otra mirada.'}</strong><br>${c.esc(q.text)}</div><button class="btn" style="margin-top:18px" data-action="quiz-next">${quizIndex === 4 ? 'Ver resultado' : 'Siguiente pregunta'} ${c.icon('right')}</button>`;
  }
  function privacy() {
    c.$('#article-dialog-title').textContent = 'Tu privacidad';
    c.$('#article-content').innerHTML =
      '<h3 class="article-title">Tu viaje se queda con vos.</h3><p class="lead">Guardá tus lugares favoritos sin crear una cuenta.</p><h3>Tu selección</h3><p>Los lugares guardados, sus días de visita y tu preferencia de movimiento se conservan en este navegador. Podés descargar tu viaje para llevarlo a otro dispositivo.</p><h3>Cómo borrar tus datos</h3><p>Abrí «Mi viaje» y elegí «Vaciar mi viaje». También podés eliminar los datos del sitio desde la configuración del navegador.</p><h3>Enlaces externos</h3><p>Al abrir el sitio de un establecimiento, consultá sus condiciones de privacidad y reserva.</p>';
    c.openDialog('article-dialog');
  }

  Object.defineProperties(c, {
    questions: { configurable: true, get: () => questions },
    quizIndex: {
      configurable: true,
      get: () => quizIndex,
      set: (value) => {
        quizIndex = value;
      },
    },
    quizScore: {
      configurable: true,
      get: () => quizScore,
      set: (value) => {
        quizScore = value;
      },
    },
    answered: {
      configurable: true,
      get: () => answered,
      set: (value) => {
        answered = value;
      },
    },
    renderQuiz: { configurable: true, get: () => renderQuiz },
    answerQuiz: { configurable: true, get: () => answerQuiz },
    privacy: { configurable: true, get: () => privacy },
  });
}
