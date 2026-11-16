export interface Source {
  title: string;
  url: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  text: string;
  sources: readonly Source[];
  tags: readonly string[];
  kind: 'place' | 'story' | 'circuit' | 'topic' | 'activity';
  placeId?: number;
  aliases?: readonly string[];
  relatedPlaceIds?: readonly number[];
}

const STOP_WORDS = new Set(
  `algo asi bajo bien con como cual cuales cuando cuanta cuantas cuanto cuantos del donde ella ellas ello ellos entre era eran esa esas ese esos esta estan estar estas este esto estos fueron hay hoy las les los mas menos muy necesito nos nueva nuevo otra otras otro otros para pero poco por porque posible puede puedo quiere quiero que sea ser sin sobre solo son sus tal tiene tienen todo todos una unas uno unos usted ustedes van habla hablame poder sabes contame conta contar cuentame explica explicame hablar decir decis decime informacion decirme saber tendria respecto`.split(
    ' ',
  ),
);

const RELATED_TERMS = new Map(
  Object.entries({
    animal: 'fauna',
    animales: 'fauna',
    aves: 'ave',
    pajaro: 'ave',
    pajaros: 'ave',
    planta: 'flora',
    plantas: 'flora',
    vegetacion: 'flora',
    molienda: 'molino',
    moler: 'molino',
    piedra: 'roca',
    piedras: 'roca',
    suelo: 'suelo',
    suelos: 'suelo',
  }),
);

export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function term(word: string) {
  const related = RELATED_TERMS.get(word);
  if (related) return related;
  if (word.length > 5 && word.endsWith('ciones')) return word.slice(0, -2);
  if (word.length > 4 && /[aeiou]s$/.test(word)) return word.slice(0, -1);
  return word;
}

function tokens(text: string) {
  return normalize(text)
    .split(' ')
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
    .map(term);
}

function distinct(words: string[]) {
  return [...new Set(words)];
}

function independentQuestions(question: string) {
  return question
    .split(/[¿?!;]+/u)
    .flatMap((part) =>
      normalize(part).split(
        /\s+(?:y|ademas)\s+(?=(?:(?:tambien|luego|despues|de paso)\s+)?(?:que|como|cuanto|donde|quien|cual|agrega|anade|recomenda|dame|decime|explica|contame)\b)/u,
      ),
    )
    .flatMap((part) => {
      const comparison = /\b(?:comparar|distinguen|contrastar) (?:entre )?(.+?) y (.+)/u.exec(part);
      return comparison ? [comparison[1]!, comparison[2]!] : [part];
    })
    .filter(Boolean);
}

function containsPhrase(text: string, phrase: string) {
  return ` ${text} `.includes(` ${phrase} `);
}

function validSource(source: Source) {
  if (!source.title.trim() || /[\s\\]/u.test(source.url)) return false;
  if (/^\/(?!\/)/.test(source.url)) return true;
  try {
    const url = new URL(source.url);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function createKnowledgeIndex(documents: readonly KnowledgeDocument[]) {
  const frequency = new Map<string, number>();
  const indexed = documents.flatMap((document) => {
    const sources = document.sources.filter(validSource);
    if (!sources.length || !document.text.trim()) return [];
    const text = tokens(document.text);
    const counts = new Map<string, number>();
    for (const word of text) counts.set(word, (counts.get(word) ?? 0) + 1);
    const titleTerms = new Set(tokens(document.title));
    const tagTerms = new Set(tokens(document.tags.join(' ')));
    for (const word of new Set([...counts.keys(), ...titleTerms, ...tagTerms])) {
      frequency.set(word, (frequency.get(word) ?? 0) + 1);
    }
    return [
      {
        document: { ...document, sources },
        exactTitle: normalize(document.title),
        aliases: (document.aliases ?? [])
          .filter((alias) => /^\p{Lu}/u.test(alias) || alias.trim().includes(' '))
          .map(normalize),
        counts,
        titleTerms,
        tagTerms,
        length: text.length,
      },
    ];
  });
  const averageLength = Math.max(
    1,
    indexed.reduce((sum, item) => sum + item.length, 0) / (indexed.length || 1),
  );
  const idf = (word: string) =>
    Math.log(
      1 + (indexed.length - (frequency.get(word) ?? 0) + 0.5) / ((frequency.get(word) ?? 0) + 0.5),
    );

  function rank(question: string, linkedPlace?: number) {
    const wordList = distinct(tokens(question)).slice(0, 32);
    const query = normalize(question);
    const requestedCodes = new Set(
      [...query.matchAll(/\b(?:gms|geositio) +0*(\d{1,2})\b/g)].map((match) => Number(match[1])),
    );
    return indexed
      .flatMap((item) => {
        const { document, exactTitle, aliases, counts, titleTerms, tagTerms, length } = item;
        if (linkedPlace !== undefined && !document.relatedPlaceIds?.includes(linkedPlace))
          return [];
        const hasCode = document.placeId !== undefined && requestedCodes.has(document.placeId);
        const titleMatch = exactTitle.length > 0 && containsPhrase(query, exactTitle);
        const aliasMatch = aliases.some((alias) => containsPhrase(query, alias));
        const exact = document.kind === 'place' && (hasCode || titleMatch || aliasMatch);
        let matchingTerms = 0;
        let score = exact ? (hasCode || titleMatch ? 20 : 14) : 0;
        for (const word of wordList) {
          const tf = counts.get(word) ?? 0;
          const inTitle = titleTerms.has(word);
          const inTags = tagTerms.has(word);
          if (!tf && !inTitle && !inTags) continue;
          matchingTerms++;
          // BM25 body similarity. Titles are stronger than region and category tags.
          const bodyWeight = (2.2 * tf) / (tf + 1.2 * (0.4 + (0.6 * length) / averageLength));
          score +=
            idf(word) * (bodyWeight + (inTags ? 1.5 : 0)) + (inTitle ? 1 + 3 * idf(word) : 0);
        }
        const coverage = matchingTerms / (wordList.length || 1);
        const coverageFloor = linkedPlace === undefined ? 0.25 : 0.15;
        if (!exact && (!matchingTerms || coverage < coverageFloor || score < 1)) return [];
        return [{ document, score: score * (0.6 + coverage), exact }];
      })
      .sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id));
  }

  return {
    retrieve(
      question: string,
      previousQuestion?: string,
      placeId?: number,
      previousAnswer?: string,
    ): KnowledgeDocument[] {
      const results = rank(question);
      const parts = independentQuestions(question);
      const partMatches =
        parts.length < 2 ? [] : parts.slice(0, 4).flatMap((part) => rank(part).slice(0, 2));
      const specificPlace = indexed.find(
        ({ document }) =>
          document.kind === 'place' &&
          (document.placeId === placeId || document.id === `place-${placeId}`) &&
          placeId !== undefined,
      )?.document;
      const currentQuestion = normalize(question);
      const followsContext =
        /^y\b/u.test(currentQuestion) ||
        /\b(?:ahi|alli|aca|aqui|este lugar|ese lugar|esta ficha|ese sitio|este sitio|su historia|su origen|ese geositio|este geositio|que mas|amplia|profundiza|eso|esa roca|estas rocas|su edad)\b/.test(
          currentQuestion,
        ) ||
        tokens(question).length < 3;
      const identities = results.filter((item) => item.exact).map((item) => item.document);
      const continuity = followsContext ? rank(previousQuestion ?? '') : [];
      // The previous answer can identify the place, but evidence is retrieved
      // from the catalogue even when the conversation history is fabricated.
      const replyMatches = followsContext ? rank(previousAnswer ?? '') : [];
      const previousPlace = [...replyMatches, ...continuity].find((item) => item.exact)?.document;
      const context = identities.length ? undefined : (specificPlace ?? previousPlace);
      const linkedPlace = (context ?? identities[0])?.placeId;
      const linked = linkedPlace === undefined ? [] : rank(question, linkedPlace).slice(0, 2);
      const topScore = results[0]?.score ?? 0;
      const candidates = results
        .filter((item) => item.exact || item.score >= 0.43 * topScore)
        .map((item) => item.document);
      const lastTopic = !context && !identities.length ? continuity[0]?.document : undefined;
      const selected = [
        context,
        ...identities,
        ...partMatches.map((item) => item.document),
        candidates[0],
        ...linked.map((item) => item.document),
        lastTopic,
        ...candidates,
      ].filter((item) => item !== undefined);
      return [...new Map(selected.map((item) => [item.id, item])).values()].slice(0, 6);
    },
  };
}
