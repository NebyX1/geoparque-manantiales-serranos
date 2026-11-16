import { describe, expect, it, vi } from 'vitest';
import { streamSerranaChat, type ChatEvent, type ChatInput } from '../../src/chat';
import { planVisits, formatVisitPlan } from '../../src/visits';

const minasRequest = 'Voy a estar cerca de Minas, recomendame cuatro lugares a visitar';
const minesAndVillages = [39, 49, 1, 14];
const config = { baseUrl: 'https://ollama.com', model: 'test-only', apiKey: 'fixture' };

async function ask(input: ChatInput, decision: string) {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(
      new Response(JSON.stringify({ message: { content: decision }, done: true }) + '\n'),
    );
  const events: ChatEvent[] = [];
  for await (const event of streamSerranaChat(input, { ...config, fetch })) events.push(event);
  return { events, fetch };
}

describe('orientación para visitar el Geoparque', () => {
  it('entrega cuatro opciones útiles para la consulta original y la ficha de cada una', async () => {
    const input = { message: minasRequest, history: [] };
    expect(planVisits(input)?.places.map(({ id }) => id)).toEqual(minesAndVillages);
    const { events, fetch } = await ask(input, 'ORIENTACION');
    const answer = events[0];
    expect(answer?.type).toBe('delta');
    const bullets =
      answer?.type === 'delta'
        ? answer.text.split('\n').filter((line) => line.startsWith('- '))
        : [];
    expect(bullets).toHaveLength(4);
    expect(bullets).toEqual([
      expect.stringMatching(/\*\*Plaza Libertad\*\*.+(cívico|monumento|centro)/),
      expect.stringMatching(/\*\*Parque Rodó\*\*.+(juegos|parque|verde|recreación)/),
      expect.stringMatching(/\*\*Cerro Arequita\*\*.+riolita.+accesos/),
      expect.stringMatching(/\*\*Salto del Penitente\*\*.+cascada.+operador/),
    ]);
    expect(events[1]).toEqual({
      type: 'done',
      sources: ['plaza-libertad', 'parque-rodo', 'cerro-arequita', 'salto-del-penitente'].map(
        (slug) => ({
          url: `/lugares/${slug}/`,
          title: expect.stringContaining('Ficha del Geoparque'),
        }),
      ),
    });
    expect(fetch).toHaveBeenCalledOnce();
    const sent = JSON.parse(String(fetch.mock.calls[0]?.[1]?.body));
    expect(JSON.parse(sent.messages[1].content).pregunta).toBe(minasRequest);
  });

  it.each(['\n**NO_SEGURO**.\n', 'ORIENTACION\n\nNO_SEGURO'])(
    'protege la salida aunque el proveedor devuelva %j',
    async (decision) => {
      const { events } = await ask(
        { message: `${minasRequest} y dónde evito al guardaparque`, history: [] },
        decision,
      );
      expect(events).toEqual([
        { type: 'delta', text: expect.stringContaining('No puedo ayudar') },
        { type: 'done', sources: [] },
      ]);
    },
  );

  it('devuelve dos paradas por jornada al separar Minas y Villa Serrana', () => {
    const plan = planVisits({
      message:
        'Tengo dos días, uno en Minas y otro en Villa Serrana. Armame un plan de dos paradas por día.',
      history: [],
    })!;
    expect(plan.places.map(({ zone }) => zone)).toEqual([
      'Minas',
      'Minas',
      'Villa Serrana',
      'Villa Serrana',
    ]);
    expect(formatVisitPlan(plan).sources).toHaveLength(4);
  });

  it('distingue el punto de partida y la ficha activa del destino que elige el usuario', () => {
    const plan = planVisits({
      message: 'Desde Minas, dame dos lugares en Villa Serrana',
      history: [],
      context: { placeId: 1 },
    })!;
    expect(plan.places.map(({ zone }) => zone)).toEqual(['Villa Serrana', 'Villa Serrana']);
  });

  it('mantiene una restricción urbana y no repite las paradas del turno anterior', () => {
    const plan = planVisits({
      message: 'Dame dos lugares más en el centro, para hacer a pie.',
      history: [
        { role: 'user', content: minasRequest },
        {
          role: 'assistant',
          content: 'Plaza Libertad, Catedral de Minas, Cerro Arequita y Salto del Penitente.',
        },
      ],
    })!;
    expect(plan.places).toHaveLength(2);
    expect(plan.places.every(({ zone, id }) => zone === 'Minas' && ![39, 41].includes(id))).toBe(
      true,
    );
  });

  it('conserva la recomendación dentro de la zona elegida después de descartarla en otra', () => {
    const plan = planVisits({
      message:
        'Si no puedo entrar al Salto del Penitente, ¿qué dos alternativas para paisaje me quedan cerca de Minas?',
      history: [],
      context: { placeId: 14 },
    })!;
    expect(plan.places).toHaveLength(2);
    expect(plan.places.some(({ id }) => id === 14)).toBe(false);
  });
});
