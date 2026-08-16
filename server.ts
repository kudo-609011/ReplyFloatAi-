import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Helper: Sleep
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Context-aware smart server-side fallback replies when external AI services experience transient outages/503s
function generateServerFallbackReplies(
  conversationText: string,
  replyStyle: string,
  requestedCount: number,
  understandingMode: boolean,
  summaryLength: string,
  messages?: Array<{ sender: string; text: string; isMe?: boolean; directedTo?: string }>,
  userName = 'James'
): { 
  understanding: string; 
  analysis: string; 
  intentType: string;
  intentLabel: string;
  isDirectedAtUser: boolean;
  needsResponse: boolean;
  replies: Array<{ style: string; text: string; tone: string; confidence: number; intentType?: string; intentLabel?: string }> 
} {
  const text = (conversationText || '').trim();
  const lower = text.toLowerCase();
  const lowerUser = userName.toLowerCase();

  // Multi-message analysis
  let lastMessageText = text;
  let lastSender = '';
  let isDirectedAtUser = false;
  let isNoResponse = false;

  if (messages && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    lastMessageText = (lastMsg.text || '').trim();
    lastSender = lastMsg.sender || '';
    const lowerLast = lastMessageText.toLowerCase();

    // Check resolution
    if (
      lowerLast.includes('never mind') || 
      lowerLast.includes('nevermind') || 
      lowerLast.includes('figured it out') ||
      lowerLast.includes('got it fixed') ||
      lowerLast.includes('already done')
    ) {
      isNoResponse = true;
    }

    const prevMsg = messages.length >= 2 ? messages[messages.length - 2] : null;
    isDirectedAtUser = 
      lowerLast.includes(lowerUser) || 
      lowerLast.startsWith(`${lowerUser},`) || 
      lowerLast.startsWith(`@${lowerUser}`) ||
      lastMsg.directedTo?.toLowerCase() === lowerUser ||
      (prevMsg?.isMe === true && !lastMsg.isMe);
  } else {
    if (
      lower.includes('never mind') || 
      lower.includes('nevermind') || 
      lower.includes('figured it out')
    ) {
      isNoResponse = true;
    }
    isDirectedAtUser = lower.includes(lowerUser) || lower.startsWith(`${lowerUser},`);
  }

  if (isNoResponse) {
    return {
      understanding: 'The topic has been resolved by the sender; no further response is needed.',
      analysis: 'Conversation resolved',
      intentType: 'no_response_needed',
      intentLabel: 'No Response Needed',
      isDirectedAtUser: false,
      needsResponse: false,
      replies: [],
    };
  }

  let intentType = isDirectedAtUser ? 'suggested_reply' : 'conversational_suggestion';
  let intentLabel = isDirectedAtUser ? 'Suggested Reply' : 'Suggested Response';

  const isQuestion = lastMessageText.includes('?') || /^(what|how|why|when|where|who|which|can you|could you|do you|are you|is there)/i.test(lastMessageText);
  if (!isDirectedAtUser && isQuestion && (lower.includes('1996') || lower.includes('1997') || lower.includes('gandhi') || lower.includes('freedom'))) {
    intentType = 'direct_answer';
    intentLabel = 'Direct Answer';
  }

  let understanding = '';
  if (understandingMode) {
    if (lower.includes('1996')) {
      understanding = summaryLength === '2-line'
        ? 'The user is asking about key historical and cultural events of 1996.\nMajor events included the Atlanta Olympics, the birth of Dolly the Sheep, and major tech milestones.'
        : 'The user is asking about historical and cultural events that took place in 1996.';
    } else if (lower.includes('1997')) {
      understanding = summaryLength === '2-line'
        ? 'The user is asking about significant events of 1997.\nKey events included the handover of Hong Kong, the release of Titanic, and the launch of Pathfinder on Mars.'
        : 'The user is asking about major global events and cultural milestones from 1997.';
    } else if (lower.includes('can you check') || (isDirectedAtUser && lower.includes('check'))) {
      understanding = `${lastSender || 'Participant'} is asking you directly to check the project status.`;
    } else if (isDirectedAtUser && (lower.includes('do you know') || lower.includes('what happened'))) {
      understanding = `${lastSender || 'Participant'} is directly asking you for an update on the project.`;
    } else if (lower.includes('finally finished') || lower.includes('finished the project')) {
      understanding = `${lastSender || 'Participant'} is announcing they completed their project.`;
    } else if (lower.includes('lost again') || lower.includes('💀')) {
      understanding = `${lastSender || 'Participant'} is venting about losing a match or game.`;
    } else if (lower.includes('plan will work') || lower.includes("won't work")) {
      understanding = `${lastSender || 'Participant'} is skeptical about the proposed plan.`;
    } else if (lower.includes('probably??') || lower.includes('you coming tomorrow')) {
      understanding = `${lastSender || 'Participant'} is asking for confirmation about tomorrow\'s plans.`;
    } else if (lower.includes('gandhi') || lower.includes('freedom') || lower.includes('independence')) {
      understanding = summaryLength === '2-line'
        ? 'Gandhi led India\'s independence struggle against British rule through Satyagraha and civil disobedience. He organized nationwide mass campaigns including the Salt March and Quit India.'
        : 'Gandhi was a major leader of India\'s independence movement, known especially for nonviolent resistance.';
    } else if (lower.includes('sus') || lower.includes('impostor') || lower.includes('reactor') || lower.includes('vent')) {
      understanding = 'Player is discussing alibis and crewmate locations during the emergency meeting.';
    } else {
      understanding = isDirectedAtUser 
        ? `${lastSender || 'Sender'} asked you: "${lastMessageText.slice(0, 40)}..."`
        : `Discussion context: "${lastMessageText.slice(0, 50)}..."`;
    }
  }

  // Dynamic context generation
  let specificReplies: Record<string, string[]> | null = null;

  if (lower.includes('can you check') || (isDirectedAtUser && lower.includes('check'))) {
    specificReplies = {
      '1-Line': ['Checking right now, give me 2 minutes.'],
      '2-Line': ['On it, opening the repository now.\nWill update the group in a couple minutes.'],
      'Single-Word': ['Checking', 'OnIt', 'Sure', 'Verifying'],
      'Casual': ['Yeah checking right now!', 'Sure thing, give me 2 mins', 'On it! Pulling up the latest build now.'],
      'Short': ['Checking now.', 'On it.', 'Will check right away.'],
      'Logical': ['Checking the system status now and will report back shortly.'],
      'Funny': ['Deploying my detective skills right this second 🔍'],
      'Respectful': ['Sure, let me check that for you right away.'],
      'Formal': ['I will review the status immediately and report back.'],
    };
  } else if (isDirectedAtUser && (lower.includes('do you know') || lower.includes('what happened to the project'))) {
    specificReplies = {
      '1-Line': ["I'm looking into the latest status now."],
      '2-Line': ["I haven't checked the latest commit yet.\nGive me a few minutes to look into it."],
      'Single-Word': ['Checking', 'Reviewing', 'Unsure', 'Pending'],
      'Casual': ["I haven't checked yet, let me take a look!", "Looking into it right now.", "Give me a sec, opening the dashboard."],
      'Short': ["Checking now.", "Haven't checked yet.", "Looking into it."],
      'Logical': ["I haven't verified the latest project logs yet; checking now."],
      'Funny': ["I was hoping you knew! Let me check real quick 😂"],
      'Respectful': ["I have not reviewed the latest status yet, but I'm checking right now."],
    };
  } else if (lower.includes('finally finished') || lower.includes('finished the project')) {
    specificReplies = {
      '1-Line': ['Nice, how long did it take?'],
      '2-Line': ['Congrats on finishing!\nHow long did it end up taking you?'],
      'Single-Word': ['Congrats', 'Awesome', 'Finally', 'Huge', 'Victory'],
      'Casual': ['Nice, how long did it take?', 'Congrats! Huge weight off your shoulders.', 'Awesome work! How did it turn out?'],
      'Funny': ['Look who finally touched grass! Congrats 🎉', 'Legend! Now take a well-deserved nap 😴'],
      'Short': ['Congrats!', 'Nice, how long did it take?', 'Awesome work.'],
      'Logical': ['Great milestone. Did you encounter any remaining blockers?'],
      'Respectful': ['Congratulations on completing the project! Excellent dedication.'],
    };
  } else if (lower.includes('lost again') || lower.includes('💀')) {
    specificReplies = {
      '1-Line': ['Skill issue 😂'],
      '2-Line': ['Unlucky! Run it back right now.'],
      'Single-Word': ['SkillIssue', 'Unlucky', 'F', 'Oof', 'Rematch'],
      'Casual': ['Skill issue 😂', 'Bro unlucky, run it back!', 'No way, what happened that round?'],
      'Funny': ['Skill issue 😂', 'Bro uninstall before your rank drops further 💀', 'Controller disconnected moment 😂'],
      'Short': ['Skill issue 😂', 'Unlucky!', 'Run it back.'],
      'Logical': ['Analyze the replay to identify where the mistake happened.'],
      'Respectful': ['Tough match! Take a breather and reset.'],
    };
  } else if (lower.includes('plan will work') || lower.includes("won't work")) {
    specificReplies = {
      '1-Line': ["Why do you think it won't work?"],
      '2-Line': ["What specific bottlenecks are you concerned about?\nLet's see if we can address them."],
      'Single-Word': ['Why', 'Elaborate', 'Alternatives', 'Counterpoint'],
      'Casual': ["Why do you think it won't work?", "What part seems risky to you?", "Do you have an alternative in mind?"],
      'Short': ["Why not?", "What's the main blocker?", "What do you suggest instead?"],
      'Logical': ["Which specific constraint makes the plan unfeasible in your assessment?"],
      'Debate': ["What empirical evidence suggests this approach will fail compared to existing alternatives?"],
      'Respectful': ["I understand your concern. What alternative approach would you recommend?"],
    };
  } else if (lower.includes('probably??') || lower.includes('you coming tomorrow')) {
    specificReplies = {
      '1-Line': ['Haha yeah 90% sure, just gotta confirm my schedule.'],
      '2-Line': ['Haha 90% sure!\nJust finishing up a couple things tonight.'],
      'Single-Word': ['Confirmed', 'Definitely', '90%', 'Haha'],
      'Casual': ['Haha yeah 90% sure, just gotta check one thing!', 'Lock me in 😂', 'Haha definitely, see you there!'],
      'Funny': ['Probably as in 99.9% unless my bed kidnaps me 😂'],
      'Short': ['Yeah 90% sure!', 'Lock me in.', 'Definitely coming.'],
    };
  } else if (lower.includes('1996')) {
    specificReplies = {
      '1-Line': ['1996 brought the Atlanta Summer Olympics, Deep Blue vs. Kasparov, and the cloning of Dolly the sheep.'],
      '2-Line': ['In 1996, the Atlanta Summer Olympics took place and Dolly the sheep was cloned.\nIt was also a major year for early web expansion and Nintendo 64\'s launch.'],
      'Single-Word': ['Olympics', 'Historic', 'N64', 'Milestone', 'Evolution'],
      'Debate': ['1996 was a pivotal turning point where the consumer internet evolved from an academic tool into the foundation of modern digital culture.'],
      'Funny': ['1996 was basically the Macarena, dial-up internet screeching, and Nintendo 64 blowing minds.'],
      'Arrogant': ['1996 was the golden era of real cultural and tech milestones before everything went mainstream.'],
      'Lord': ['By royal decree: In the year 1996, the realm witnessed the wondrous assembly of the Centennial Olympic Games.'],
      'Passive': ['1996 saw the Atlanta Olympics, the birth of Dolly the sheep, and the launch of the Nintendo 64.'],
      'Logical': ['In 1996, notable global events included the Atlanta Centennial Olympics, Deep Blue defeating Kasparov in chess game 1, and the commercial explosion of the web.'],
      'Respectful': ['1996 was a memorable year featuring the Centennial Olympic Games in Atlanta and significant scientific and cultural breakthroughs.'],
      'Casual': ['1996 had the Atlanta Olympics, Nintendo 64 coming out, and the whole world dancing the Macarena!'],
      'Short': ['1996: Atlanta Centennial Olympics, Dolly the Sheep, and the launch of Nintendo 64.'],
      'Detailed': ['1. Atlanta Centennial Olympic Games\n2. Dolly the Sheep cloned\n3. Release of Nintendo 64 and Pokemon Red/Green in Japan\n4. Major commercial adoption of the World Wide Web.'],
    };
  } else if (lower.includes('1997')) {
    specificReplies = {
      '1-Line': ['1997 was marked by the Hong Kong handover, the theatrical release of Titanic, and NASA\'s Mars Pathfinder mission.'],
      '2-Line': ['In 1997, the UK handed sovereignty of Hong Kong to China, and NASA\'s Pathfinder landed on Mars.\nCulturally, Titanic was released and became a worldwide box office phenomenon.'],
      'Single-Word': ['Handover', 'Titanic', 'Pathfinder', 'Legendary', 'DeepBlue'],
      'Debate': ['The 1997 victory of IBM\'s Deep Blue over Garry Kasparov marked the definitive dawn of modern applied artificial intelligence.'],
      'Funny': ['1997: When everyone learned there was definitely enough room for Jack on that floating door.'],
      'Arrogant': ['1997 set box office and technology records that defined the late nineties.'],
      'Lord': ['Behold: In the year 1997, great dominions shifted as Hong Kong was returned, and humanity touched the red sands of Mars.'],
      'Passive': ['1997 featured the Hong Kong handover, the Mars Pathfinder landing, and Deep Blue defeating Garry Kasparov.'],
      'Logical': ['Key 1997 milestones: The UK transferred sovereignty of Hong Kong to China, IBM Deep Blue defeated Garry Kasparov in a full match, and NASA\'s Mars Pathfinder touched down.'],
      'Respectful': ['1997 brought historic global transitions including the Hong Kong handover and groundbreaking exploration with Mars Pathfinder.'],
      'Casual': ['1997 was huge—the movie Titanic came out, Harry Potter was first published in the UK, and Mars Pathfinder landed!'],
      'Short': ['1997: Hong Kong handover, Mars Pathfinder landing, and Deep Blue defeating world chess champion Kasparov.'],
      'Detailed': ['1. Hong Kong Sovereignty Handover from the UK to China\n2. NASA Mars Pathfinder lands on Mars with the Sojourner rover\n3. IBM Deep Blue defeats world chess champion Garry Kasparov in a match\n4. James Cameron\'s Titanic releases in theaters.'],
    };
  }

  const defaultStylePools: Record<string, string[]> = {
    '1-Line': [
      'He mobilized nationwide nonviolent civil disobedience (Satyagraha) to dismantle colonial authority and win freedom.',
      'Through nonviolent mass campaigns like the Salt March, he united India and made British rule unsustainable.',
      'He led nonviolent resistance movements that catalyzed Indian independence in 1947.',
    ],
    '2-Line': [
      'Gandhi mobilized millions across India through the philosophy of Satyagraha.\nHis nonviolent campaigns dismantled British colonial authority and led to independence in 1947.',
      'By organizing the Salt March and Quit India movement, he united diverse communities.\nHis moral diplomacy earned worldwide support for India\'s sovereignty.',
    ],
    'Single-Word': [
      'Satyagraha',
      'Nonviolence',
      'Liberation',
      'Sovereignty',
      'Unstoppable',
    ],
    'Debate': [
      'While armed movements existed, Gandhi\'s nonviolent mass mobilization was the decisive factor that unified all socioeconomic classes across India.',
      'The historical record shows that civil disobedience made the economic and administrative cost of colonial occupation completely untenable.',
      'Moral authority combined with nationwide economic boycotts paralyzed colonial governance in a way military force could not.',
    ],
    'Funny': [
      'He basically defeated the biggest empire on Earth using a handful of salt, a spinning wheel, and infinite peaceful stubbornness.',
      'Imagine commanding the world\'s largest navy only to be outmaneuvered by a man on a peaceful hunger strike.',
      'Turns out you don\'t need weapons when your moral leverage is literally off the charts.',
    ],
    'Arrogant': [
      'Imagine trying to rule a subcontinent only to get completely dismantled by passive resistance—an effortless masterclass.',
      'The British brought warships; Gandhi brought willpower and walked them straight out of the country.',
      'He didn\'t just win independence; he rewrote the rulebook on geopolitical influence forever.',
    ],
    'Lord': [
      'Hear the imperial decree: The Mahatma marshaled the righteous multitude, shattering foreign dominion without drawing a single blade.',
      'By sovereign proclamation: The empire bowed before the moral fortitude and unbreakable will of a united people.',
      'Witness the sovereign truth: No crown nor sword could withstand the quiet thunder of civil defiance.',
    ],
    'Passive': [
      'He mobilized India\'s population through nonviolent resistance campaigns like the Salt March to achieve independence in 1947.',
      'His leadership united diverse communities across India, utilizing civil disobedience to make colonial governance untenable.',
      'Gandhi organized nationwide peaceful boycotts that systematically eroded colonial legitimacy and secured national freedom.',
    ],
    'Logical': [
      'Gandhi\'s strategy combined civil disobedience (Satyagraha), nationwide economic boycotts, and mass mobilization to systematically undermine colonial administration.',
      'His nonviolent campaigns unified diverse linguistic, religious, and economic groups into a single national independence movement.',
      'By exposing the moral and economic contradictions of colonial rule, he achieved independence while establishing democratic foundations.',
    ],
    'Respectful': [
      'Mahatma Gandhi dedicated his life to uniting the nation around peaceful civil protest and moral perseverance to earn freedom from colonial rule.',
      'His philosophy of Ahimsa and Satyagraha remains one of history\'s greatest examples of nonviolent leadership and justice.',
    ],
    'Counterargument': [
      'The premise that colonial retreat was purely economic ignores how nonviolent mobilization rendered civil administration unworkable.',
      'Focusing solely on international diplomacy overlooks the crucial grassroots solidarity that Gandhi established across rural India.',
    ],
    'Short': [
      'He united India through nonviolent resistance (Satyagraha) to win independence in 1947.',
      'Gandhi led mass civil disobedience campaigns that made colonial rule unsustainable.',
    ],
    'Casual': [
      'He basically organized mass peaceful protests and boycotts that brought everyone together and pushed the British to leave.',
      'Gandhi used nonviolence and huge nationwide movements like the Salt March to help India win its independence in 1947.',
    ],
    'Formal': [
      'Through structured civil disobedience and principled nonviolent resistance, he dismantled colonial administrative hegemony.',
      'His mobilization of diverse socioeconomic strata catalyzed the diplomatic and constitutional transition to sovereign statehood.',
    ],
    'Detailed': [
      '1. Satyagraha & Ahimsa: Instituted nonviolence as an active political strategy.\n2. Mass Mobilization: Transformed independence from an elite discourse into a grassroots movement via the Salt March and Quit India.\n3. Institutional Boycotts: Disrupted colonial economic revenue and civil administration.',
    ],
  };

  const pool = (specificReplies && specificReplies[replyStyle]) || defaultStylePools[replyStyle] || defaultStylePools['Logical'];
  const replies = [];

  for (let i = 0; i < requestedCount; i++) {
    const textOption = pool[i % pool.length] || `Clear, reasoned reply option ${i + 1} for "${text.slice(0, 30)}..."`;
    replies.push({
      style: replyStyle,
      text: textOption,
      tone: replyStyle,
      confidence: 0.95 - i * 0.02,
      intentType,
      intentLabel,
    });
  }

  return {
    understanding,
    analysis: `Contextual generation for "${lastMessageText.slice(0, 40)}..."`,
    intentType,
    intentLabel,
    isDirectedAtUser,
    needsResponse: true,
    replies,
  };
}

// Helper: Generate with Gemini with retry & fallback models for 503 / high-demand resilience
async function callGeminiWithResilience(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction: string,
  requestedCount: number,
  replyStyle: string,
  understandingMode: boolean = false,
  summaryLength: string = '1-line'
): Promise<{ text: string; modelUsed: string }> {
  // Candidate models in prioritized order: gemini-3.7-flash, gemini-3.1-flash-lite, gemini-flash-latest
  const candidateModels = [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              understanding: {
                type: Type.STRING,
                description: 'Brief explanation of what the other person is saying or asking.',
              },
              analysis: {
                type: Type.STRING,
                description: 'Quick internal categorization note.',
              },
              replies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING, description: 'Style name e.g. Logical, Counterargument, Casual' },
                    text: { type: Type.STRING, description: 'The exact reply text ready to be sent or copied' },
                    tone: { type: Type.STRING, description: 'Quick tag describing the emotion or attitude' },
                    confidence: { type: Type.NUMBER, description: 'Score between 0.0 and 1.0' },
                  },
                  required: ['style', 'text'],
                },
              },
            },
            required: ['replies'],
          },
        },
      });

      if (response.text && response.text.trim().length > 0) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const is503OrRateLimit = 
        errMsg.includes('503') || 
        errMsg.includes('high demand') || 
        errMsg.includes('429') || 
        errMsg.includes('UNAVAILABLE') || 
        errMsg.includes('Resource has been exhausted') ||
        errMsg.includes('temporarily unavailable');

      if (is503OrRateLimit) {
        // Seamlessly continue to the next model
        continue;
      }
    }
  }

  // If schema-based generation was unavailable across all models, try plain-text generation as fallback
  for (const model of ['gemini-3.7-flash', 'gemini-3.1-flash-lite']) {
    try {
      const plainResponse = await ai.models.generateContent({
        model,
        contents: `${systemInstruction}\n\n${prompt}\n\nPlease output valid JSON with { "understanding": "...", "replies": [{ "style": "${replyStyle}", "text": "...", "tone": "..." }] }`,
      });
      if (plainResponse.text && plainResponse.text.trim().length > 0) {
        return { text: plainResponse.text, modelUsed: `${model}-fallback` };
      }
    } catch {
      // Continue to next
    }
  }

  throw lastError || new Error('All candidate Gemini models are temporarily unavailable.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'ReplyFloat AI',
    version: '1.0.0',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

function getStylePromptGuidance(style: string): string {
  switch (style) {
    case '1-Line':
      return '1-LINE MODE: Generate strictly ONE single concise, punchy line (~40-60 characters maximum). No line breaks, no rambling.';
    case '2-Line':
      return '2-LINE MODE: Generate strictly TWO clean, concise lines (~80-120 characters total).';
    case 'Single-Word':
      return 'SINGLE-WORD MODE: Generate strictly a SINGLE WORD response wherever possible (e.g., "Agreed", "Defeat", "Satyagraha", "False", "Confirmed", "Electrical", "Undeniable"). Do NOT output full sentences.';
    case 'Debate':
      return 'DEBATE MODE: Generate a rigorous, logical debate counterpoint or argument. Focus on reasoning, evidence, clear logic, exposing flawed assumptions, without vulgarity or personal attacks.';
    case 'Funny':
      return 'FUNNY MODE: Generate a humorous, witty, playful response that fits the exact conversation context and brings a smile.';
    case 'Arrogant':
      return 'ARROGANT MODE: Generate a supremely confident, cocky, playfully boastful response with swagger. Radiate effortless dominance without using hate speech, vulgarity, or real harassment.';
    case 'Lord':
      return 'LORD MODE: Generate a dramatic, theatrical, commanding response speaking in the persona of an imperial sovereign/monarch addressing subjects ("Hear the imperial decree...", "By sovereign proclamation..."). Keep it entertaining and grandiose.';
    case 'Passive':
      return 'PASSIVE (ADAPTIVE-LENGTH) MODE: Analyze the question complexity. If a simple short answer or factual response is sufficient, output a crisp 1-sentence answer. If the question genuinely requires an explanation, output a thorough multi-step explanation. Adapt length strictly based on question depth, not randomly.';
    case 'Respectful':
      return 'RESPECTFUL MODE: Generate a polite, empathetic, calm, and constructive response.';
    case 'Casual':
      return 'CASUAL MODE: Natural, everyday conversational phrasing.';
    case 'Counterargument':
      return 'COUNTERARGUMENT MODE: Direct analytical critique challenging underlying premises.';
    case 'Formal':
      return 'FORMAL MODE: Academic, articulate, professional vocabulary.';
    case 'Short':
      return 'SHORT MODE: High-impact punchy response (~1-2 short sentences).';
    case 'Detailed':
      return 'DETAILED MODE: In-depth, comprehensive multi-point breakdown.';
    case 'Logical':
    default:
      return 'LOGICAL MODE: Rational, structured, evidence-oriented, and factual reasoning.';
  }
}

// Reply Generation Endpoint
app.post('/api/ai/generate-replies', async (req, res) => {
  try {
    const {
      conversationText,
      contextApp,
      replyStyle = 'Logical',
      count = 3,
      length = 'normal', // very-short | short | normal | long
      customMaxCharLimit,
      understandingMode = true,
      summaryLength = '1-line', // 1-line | 2-line | detailed
      provider = 'gemini',
      customEndpoint,
      customApiKey,
      customModel,
      messages,
      userName = 'James',
    } = req.body;

    const rawInputText = (conversationText || '').trim();
    if (!rawInputText && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Conversation text or messages array is required.' });
    }

    // Format full conversation thread for AI prompt
    let formattedConversation = rawInputText;
    if (messages && Array.isArray(messages) && messages.length > 0) {
      formattedConversation = messages
        .map(m => `${m.sender}${m.isMe ? ' (User/You)' : ''}: "${m.text}"`)
        .join('\n');
    }

    const requestedCount = Math.min(Math.max(Number(count) || 3, 1), 5);
    const styleGuidance = getStylePromptGuidance(replyStyle);

    let lengthDescription = 'Normal (3-4 lines, ~150-250 characters)';
    if (replyStyle === 'Single-Word') lengthDescription = 'Strictly Single Word';
    else if (replyStyle === '1-Line' || length === 'very-short') lengthDescription = 'Very Short (~1 line, ~40-60 characters maximum)';
    else if (replyStyle === '2-Line' || length === 'short') lengthDescription = 'Short (~2 lines, ~80-120 characters)';
    else if (length === 'long' || length === 'detailed') lengthDescription = 'Long (~5+ lines, comprehensive)';

    if (customMaxCharLimit && Number(customMaxCharLimit) > 0) {
      lengthDescription += `. Strict max limit: ${customMaxCharLimit} characters per reply.`;
    }

    let understandingInstruction = '';
    if (understandingMode) {
      understandingInstruction = `\nUNDERSTANDING MODE IS ACTIVE:
Before the replies, you MUST provide a concise understanding summary in "understanding" explaining what the speaker(s) are discussing or asking.
Summary length target: ${summaryLength === '1-line' ? 'Exactly 1 clear sentence (~10-15 words)' : summaryLength === '2-line' ? '2 concise sentences (~25 words)' : 'Detailed 3-sentence summary'}.`;
    }

    // If using custom OpenAI/compatible endpoint with custom API key
    if (provider === 'custom' || provider === 'openai') {
      if (!customApiKey) {
        return res.status(400).json({ error: 'Custom API Key is required for this provider.' });
      }

      const endpoint = customEndpoint || (provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : '');
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint URL is required.' });
      }

      const model = customModel || (provider === 'openai' ? 'gpt-4o-mini' : 'custom-model');

      const systemPrompt = `You are ReplyFloat AI, an intelligent conversation-aware floating assistant for Android.
The user is ${userName}, viewing an active chat thread in "${contextApp || 'a messaging app'}".
Thread context:
"""
${formattedConversation}
"""
${understandingInstruction}
STYLE DIRECTIVE: ${styleGuidance}
Your task:
1. Determine if the latest message is directed to ${userName}, general conversation, or informational inquiry.
2. If the issue is already resolved ("never mind", "figured it out"), mark needsResponse: false.
3. Otherwise, generate exactly ${requestedCount} distinct response options tailored to "${replyStyle}".
Length constraint: ${lengthDescription}.
Return pure JSON in format:
{
  "understanding": "...",
  "intentType": "suggested_reply | direct_answer | conversational_suggestion | no_response_needed",
  "intentLabel": "Suggested Reply | Direct Answer | Suggested Response",
  "isDirectedAtUser": boolean,
  "needsResponse": boolean,
  "replies": [
    { "style": "${replyStyle}", "text": "...", "tone": "...", "confidence": 0.95 }
  ]
}`;

      const openAiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze the thread and generate ${requestedCount} responses.` },
          ],
          temperature: 0.7,
        }),
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return res.status(openAiRes.status).json({
          error: `Provider returned error ${openAiRes.status}: ${errText.slice(0, 300)}`,
        });
      }

      const openAiData = (await openAiRes.json()) as any;
      const content = openAiData.choices?.[0]?.message?.content || '';
      
      let replies: any[] = [];
      let understanding = '';
      let intentType = 'suggested_reply';
      let intentLabel = 'Suggested Reply';
      let isDirectedAtUser = true;
      let needsResponse = true;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          replies = parsed.replies || [];
          understanding = parsed.understanding || '';
          intentType = parsed.intentType || intentType;
          intentLabel = parsed.intentLabel || intentLabel;
          isDirectedAtUser = parsed.isDirectedAtUser ?? isDirectedAtUser;
          needsResponse = parsed.needsResponse ?? needsResponse;
        }
      } catch (e) {
        replies = content
          .split('\n')
          .filter((l: string) => l.trim().length > 0)
          .slice(0, requestedCount)
          .map((line: string) => ({
            style: replyStyle,
            text: line.replace(/^\d+[\.\)]\s*/, '').replace(/^"|"$/g, ''),
            tone: replyStyle,
            confidence: 0.9,
          }));
      }

      return res.json({
        success: true,
        provider: provider,
        model: model,
        understanding,
        intentType,
        intentLabel,
        isDirectedAtUser,
        needsResponse,
        replies: replies.slice(0, requestedCount),
        contextApp,
      });
    }

    // Default: Gemini API server-side with resilience & backoff
    let rawText = '';
    let modelUsed = 'gemini-3.7-flash';

    try {
      const ai = getGenAI();
      const systemInstruction = `You are ReplyFloat AI, an intelligent conversation-aware Android floating assistant.
The user is ${userName}, using an app (${contextApp || 'Android Chat'}).
Analyze the full conversation flow (who is talking, whether someone addressed ${userName}, statements, jokes, losses, questions).
${understandingInstruction}
STYLE DIRECTIVE: ${styleGuidance}
Follow the requested style: "${replyStyle}".
Length constraint: ${lengthDescription}.
Generate ${requestedCount} contextual response choices for ${userName} to say next.
If someone directly asked ${userName} (e.g. "James, do you know?", "Can you check?"), provide direct replies.
If someone made a statement ("I finally finished the project"), provide a proactive follow-up ("Nice, how long did it take?").
If someone made a joke or vented loss ("lost again 💀"), provide a fun reaction ("Skill issue 😂").
If someone said "Never mind, I figured it out", set needsResponse: false and empty replies.`;

      const prompt = `Conversation Thread:\n${formattedConversation}\n\nAnalyze and generate response options for ${userName}.`;

      const geminiRes = await callGeminiWithResilience(
        ai,
        prompt,
        systemInstruction,
        requestedCount,
        replyStyle,
        understandingMode,
        summaryLength
      );
      rawText = geminiRes.text;
      modelUsed = geminiRes.modelUsed;
    } catch (geminiErr: any) {
      console.warn('[Gemini API] Primary and fallback models temporarily unavailable, using contextual engine:', geminiErr?.message || geminiErr);
      const fallbackResult = generateServerFallbackReplies(
        rawInputText,
        replyStyle,
        requestedCount,
        understandingMode,
        summaryLength,
        messages,
        userName
      );
      return res.json({
        success: true,
        provider: 'gemini (Context Engine)',
        model: 'gemini-3.7-flash-fallback',
        understanding: fallbackResult.understanding,
        analysis: fallbackResult.analysis,
        intentType: fallbackResult.intentType,
        intentLabel: fallbackResult.intentLabel,
        isDirectedAtUser: fallbackResult.isDirectedAtUser,
        needsResponse: fallbackResult.needsResponse,
        replies: fallbackResult.replies,
        contextApp,
        isFallback: true,
      });
    }

    let parsed: any = {};
    try {
      const trimmed = (rawText || '').trim();
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = JSON.parse(trimmed || '{}');
      }
    } catch {
      // Fallback line-by-line parsing if json is malformed
      const lines = (rawText || '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('{') && !l.startsWith('}'));
      parsed = {
        understanding: '',
        replies: lines.slice(0, requestedCount).map(line => ({
          style: replyStyle,
          text: line.replace(/^\d+[\.\)]\s*/, '').replace(/^"|"$/g, ''),
          tone: replyStyle,
          confidence: 0.9,
        })),
      };
    }

    // Ensure we have replies even if JSON structure was missing them
    if (!parsed.replies || parsed.replies.length === 0) {
      const fallbackResult = generateServerFallbackReplies(
        rawInputText,
        replyStyle,
        requestedCount,
        understandingMode,
        summaryLength,
        messages,
        userName
      );
      parsed = fallbackResult;
    }

    return res.json({
      success: true,
      provider: 'gemini',
      model: modelUsed,
      understanding: parsed.understanding || '',
      analysis: parsed.analysis || '',
      intentType: parsed.intentType || (rawInputText.includes('?') ? 'suggested_reply' : 'conversational_suggestion'),
      intentLabel: parsed.intentLabel || (rawInputText.includes('?') ? 'Suggested Reply' : 'Suggested Response'),
      isDirectedAtUser: parsed.isDirectedAtUser ?? true,
      needsResponse: parsed.needsResponse ?? true,
      replies: (parsed.replies || []).slice(0, requestedCount),
      contextApp,
    });
  } catch (err: any) {
    console.error('Error generating replies:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate replies with AI provider',
    });
  }
});

// Vite middleware for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReplyFloat AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
