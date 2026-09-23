/**
 * The central difference between each pair of types (36 pairs), adapted from the
 * differential diagnosis appendix of Character and Neurosis. English version of
 * `diferencas` in results.js.
 */

export const diferencas = {
  '1-2': 'in the 1 the engine is duty and correction; in the 2 it is the bond and the need to be loved.',
  '1-3': 'both control themselves and are formal, but the 1 is contained and serious, guided by what is right; the 3 is expansive and lively, guided by what other people value.',
  '1-4': 'in the 1 what hurts is having done wrong; in the 4, having confirmed being worth less than others.',
  '1-5': 'both are controlled and perfectionist, but the 1 is assertive and direct, while the 5 is shy and inhibited in expression.',
  '1-6': 'both take duty seriously; the 1 is more assertive and decides, the 6 freezes at the decision and fears the mistake.',
  '1-7': 'in the 1 pleasure only comes after duty; in the 7 pleasure comes first, and without guilt.',
  '1-8': 'in the 1 anger is internalised and turns into correction and duty; in the 8 it is externalised and turns into impact and limit.',
  '1-9': 'in the 1 there is an active tension to correct what is wrong; in the 9 there is accommodation, which avoids conflict and erases one’s own wanting.',
  '2-3': 'both look after appearances and want attention, but the 2 is looser, more spontaneous and more intrusive; the 3 is controlled and attentive to limits.',
  '2-4': 'the 2 hides the neediness and presents as full; the 4 lives and shows the lack.',
  '2-5': 'the 2 moves towards the bond; the 5 withdraws from it.',
  '2-6': 'in the 2 affection seeks a special place; in the 6, protection and safety.',
  '2-7': 'both seduce and enjoy pleasure, but the 2 is genuinely emotional, while in the 7 the warmth coexists with independence and an undercurrent of non-involvement.',
  '2-8': 'the 2 can also be impulsive and arrogant, but is emotional and seductive; the 8 is active and goes straight for power.',
  '2-9': 'both are generous, but the 2 is dramatic, impatient and romantic, and charges for what is given; the 9 is discreet, patient and practical, and forgets himself without charging anything.',
  '3-4': 'the 3 controls emotion and identifies with his best version; the 4 expresses emotion and identifies with the lack.',
  '3-5': 'the 3 is efficient, social and faces things; the 5 is not very practical and avoids contact and confrontation.',
  '3-6': 'the 3’s anxiety revolves around being exposed and set aside; the 6’s, around getting it wrong and not knowing which is the right path.',
  '3-7': 'the 3 disciplines himself in order to achieve; the 7 avoids effort and goes for pleasure, with little concern for convention.',
  '3-8': 'the 3 is controlled and adapts to what is expected; the 8 is impulsive and rebellious.',
  '3-9': 'both can work a great deal and live on the surface, but the 3 is energetic and driven by other people’s eyes, and the 9 is relaxed and driven by habit.',
  '4-5': 'both feel beneath others, but the 4 clings to the relationship and weeps, and the 5 gives up and dries out.',
  '4-6': 'the 4 is emotional and expressive; the 6 is mental and inhibited.',
  '4-7': 'the 4 leans towards sadness and guilt; the 7, towards euphoria and “everything is fine”. The 4 shows anger, the 7 is kind by compulsion.',
  '4-8': 'there is intensity in both, but in the 4 the anger lasts and comes with an inner prohibition on his own desire; in the 8 it explodes, passes, and desire turns into action. The 8 invades, the 4 charges for the suffering.',
  '4-9': 'both can become depressed, but in the 4 the depression complains and asks for attention, and in the 9 it is resigned and without drama.',
  '5-6': 'both mistrust, but the 5 withdraws and the 6 attaches to whoever protects him and takes authority more into account.',
  '5-7': 'the 5 reduces his own desire; the 7 multiplies it.',
  '5-8': 'the 5 withdraws from the clash; the 8 advances.',
  '5-9': 'there is resignation and self-forgetting in both, but in the 5 it is withdrawal and little availability, and in the 9 it is participation and generosity.',
  '6-7': 'the 6 feels guilt and sees hierarchy; the 7 hardly feels guilt, treats everyone as equals and is more charming and adaptable.',
  '6-8': 'the 6 doubts and is afraid, even when charging forward; the 8 is assertive without doubt, more impulsive and less disciplined.',
  '6-9': 'the 6 is introverted, mental and oriented to hierarchy; the 9 is turned outwards, sensory-motor, and refuses hierarchy.',
  '7-8': 'the 7 is mind and charm, and gives way more; the 8 is action and dominance.',
  '7-9': 'in the 7 the fantasy life is intense, with cunning and self-indulgence; in the 9 there is little inner life, naivety and an ease in postponing his own desire.',
  '8-9': 'in the 8 anger explodes and imposes itself; in the 9 it is anaesthetised and the will dissolves to keep the peace.',
};

export const semPar =
  'observe which passion and fixation resonate most with your inner experience.';

export const porPaixao = (a, ta, b, tb) =>
  `in ${a} the passion is ${ta.paixao.toLowerCase()}, and the fixation, ${ta.fixacao.toLowerCase()}. ` +
  `In ${b} the passion is ${tb.paixao.toLowerCase()}, and the fixation, ${tb.fixacao.toLowerCase()}. ` +
  'Notice which of the two better describes what happens inside, and not only the behaviour.';
