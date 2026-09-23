/**
 * English report content: centres, types, instincts.
 *
 * Same shape as results.js. Same register too: a psychological portrait, not a
 * horoscope and not a manual. No em dashes, by editorial decision.
 */

export const triades = {
  instintiva: {
    nome: 'Instinctive / gut centre',
    tipos: [8, 9, 1],
    emocao: 'anger',
    pergunta: 'Are my space and my will being respected?',
    texto:
      'Your background reactivity organises itself around anger and the body, around the ' +
      'present, the boundary, autonomy and control. You tend to react from action before ' +
      'reflecting, and what sets you off is the sense that your territory, physical, moral or ' +
      'of the will, has been touched. This centre is averse to introspection: the movement goes ' +
      'outwards, to the concrete world, not inwards.',
  },
  emocional: {
    nome: 'Emotional / heart centre',
    tipos: [2, 3, 4],
    emocao: 'shame',
    pergunta: 'Am I worthy of love and recognition as I am, or do I need a mask?',
    texto:
      'Your background reactivity gravitates around image and identity, around how you are seen ' +
      'and loved. The core emotion is shame, and the silent question is about your own worth. ' +
      'The orientation is towards the story you tell about yourself.',
  },
  mental: {
    nome: 'Mental / head centre',
    tipos: [5, 6, 7],
    emocao: 'fear',
    pergunta: 'Am I safe? Do I have enough support and information for what is coming?',
    texto:
      'Your background reactivity organises itself around safety and orientation, around support ' +
      'and anticipation. The core emotion is fear, and attention runs to the future, to strategy ' +
      'and to the anxiety of what has not happened yet.',
  },
};

export const tipos = {
  1: {
    nome: 'Enneatype 1',
    paixao: 'Anger (internalised wrath, resentment)',
    fixacao: 'Resentment / perfectionism',
    nucleo:
      'You are the child who had to become an adult far too early, who learned that feeling was ' +
      'dangerous and that the only way out was to get things right. Where others see the world, ' +
      'you see first what is out of place: the crease in the cloth, the badly chosen word, the ' +
      'detail nobody else noticed. There is an internal ruler in you that never switches off, ' +
      'and it measures everything, including, and above all, yourself. What looks like a demand ' +
      'for perfection is, underneath, an anger that had nowhere to go: the anger of someone who ' +
      'could not complain, could not get it wrong, could not simply be a child. Since there was ' +
      'no permission to feel it, it turned into correction, of yourself, of others, of the ' +
      'world. You do not see yourself as an angry person; you see yourself as someone who wants ' +
      'what is right. But it is the same force: anger swallowed, refined, turned into duty.',
    dorDeFundo:
      'Beneath the effort to be good and correct lives a child who concluded, very early, that ' +
      'love had to be deserved, that there was something wrong in them to be fixed before they ' +
      'were worth loving. The severity you hold yourself to is that same child policing itself, ' +
      'afraid that if it loosens its grip the monster it believes it is hiding will appear. The ' +
      'tenderness you refuse yourself in the name of duty is exactly what stayed locked in ' +
      'there. And the tiredness nobody sees is the tiredness of carrying alone, without rest, ' +
      'the weight of keeping everything, and yourself, impeccable.',
  },
  2: {
    nome: 'Enneatype 2',
    paixao: 'Pride',
    fixacao: 'False generosity / the self-image of someone who only overflows',
    nucleo:
      'You learned early to be loved by giving, and you became an expert at being indispensable. ' +
      'You have the finest antenna for what other people need, sometimes before they notice it ' +
      'themselves, and you offer yourself with a warmth that charms. Underneath lives a silent ' +
      'conviction: “without me, this does not run”. Pride here is not a cold sense of being ' +
      'better; it is feeling special, chosen, someone whose presence is missed. You see yourself ' +
      'as the one who overflows and takes care, almost never as the one who needs. And that is ' +
      'where the knot is: you give in order to receive, though you would not even admit to ' +
      'yourself that you expect anything back. When affection does not come in the measure you ' +
      'feel you deserve, the charm can turn into hurt, or into a small storm.',
    dorDeFundo:
      'Behind the person full of love to give there is a child who concluded that being loved ' +
      'simply for who she was would not do; that affection had to be won by being useful, ' +
      'charming, necessary. Admitting her own need feels like the most forbidden thing in the ' +
      'world, because it contradicts the image of someone who only overflows. The pain is the ' +
      'suspicion, almost never spoken, that if you stopped giving, stopped pleasing, stopped ' +
      'being special, you would find out that you would not be chosen. The way back starts by ' +
      'letting someone take care of you without your having done anything to deserve it.',
  },
  3: {
    nome: 'Enneatype 3',
    paixao: 'Vanity',
    fixacao: 'Self-deception through image',
    nucleo:
      'You learned that you were worth what you delivered, and you became an engine. Early on ' +
      'you understood that love and applause came from success, from efficiency, from shining in ' +
      'other people’s eyes, so you became what the world values. You are quick, capable, you ' +
      'know how to present yourself, you know how to win. The problem is that, from identifying ' +
      'so completely with the good image, you lost track of where it ends and you begin. The ' +
      'emotions that get in the way of performance are set aside, postponed to a “later” that ' +
      'rarely comes. You are the person who cannot have problems, who has to cope, who feels, ' +
      'deep down, that without all that performance there would be no room left for her. And ' +
      'there is a question you avoid: would you be loved for who you are, if you were not always ' +
      'proving your worth?',
    dorDeFundo:
      'Behind the winner who makes everything look easy lives a child who felt she was only seen ' +
      'when she stood out; who learned that simply being did not draw attention, but doing, ' +
      'achieving, pleasing, did. Vanity is not a character flaw, it is an old hunger to exist in ' +
      'someone’s eyes. The deepest pain is the suspicion that if you stopped running, producing, ' +
      'keeping the facade impeccable, you would find a void where the self should be. The way ' +
      'back is the strangest thing for you: to stop, and to discover that someone is still there ' +
      'when nobody is assessing.',
  },
  4: {
    nome: 'Enneatype 4',
    paixao: 'Envy',
    fixacao: 'Melancholy / comparison',
    nucleo:
      'You carry the sense that something is missing in you that others seem to have naturally, ' +
      'and life becomes a silent comparison in which you almost always come off worse. You feel ' +
      'things deeply, intensely, and there is beauty in that, but also a tendency to court your ' +
      'own pain, to linger where it hurts, to believe that suffering enough confers a secret ' +
      'nobility. What is present rarely enchants; what is desirable is always in what is ' +
      'missing, in what is gone, in what the other person has. You do not want to be ordinary, ' +
      'you want to be special, and paradoxically you feel the most defective of all. This envy ' +
      'is not petty: it is the hunger of a child who was left with the impression of having been ' +
      'passed over, and who has felt permanently on the outside ever since.',
    dorDeFundo:
      'Underneath there is an old loss, real or sensed, a moment when you concluded that you ' +
      'were not wanted as you should have been, and since then something in you has been in ' +
      'mourning for a love that seems to have existed and disappeared. The pain is both true and ' +
      'a refuge: while you suffer, you feel that you exist, and you fear that without the ' +
      'suffering only emptiness would be left. The way back does not run through getting what is ' +
      'missing, but through a quiet revolution: realising that what you look for so hard outside, ' +
      'and envy in others, is the capacity to value what is already yours, ordinary and present.',
  },
  5: {
    nome: 'Enneatype 5',
    paixao: 'Avarice',
    fixacao: 'Retention / defensive detachment',
    nucleo:
      'You learned early that needing other people ends in disappointment, so you chose to need ' +
      'little. You withdrew inwards, into a space of your own, and there you carefully keep what ' +
      'you have: your time, your energy, your information, your inner life. Giving feels ' +
      'dangerous, as if every drop that leaves would not come back and you would end up ' +
      'destitute. You would rather observe than take part, understand than get involved, know ' +
      'than feel. There is real richness in that inner world, but it comes at a price: so as not ' +
      'to feel invaded or drained, you pull away, and in pulling away you lose the warmth that, ' +
      'deep down, you also want. It is not coldness out of malice; it is the economy of someone ' +
      'who concluded they would survive better alone, with the drawbridge up.',
    dorDeFundo:
      'Behind the detachment lives a child who found the world either too invasive or too empty, ' +
      'and who decided to protect himself by closing the floodgates of his own heart. Avarice is ' +
      'not only about money or things: it is about giving yourself, about the need you do not ' +
      'let yourself feel. The pain is the solitude you build yourself while trying to armour ' +
      'yourself against disappointment, the emptiness that deepens precisely in the attempt not ' +
      'to depend on anyone. The way back is not to receive more, it is to discover that your ' +
      'greatest wealth appears when you risk giving, when you leave the tower and inhabit the ' +
      'world with the body, not only with the mind.',
  },
  6: {
    nome: 'Enneatype 6',
    paixao: 'Fear',
    fixacao: 'Doubt / suspicion',
    nucleo:
      'You live with an antenna tuned to what could go wrong, a watchfulness that rarely rests. ' +
      'It is not cowardice, it is a mind that checks, questions, looks for guarantees, because ' +
      'at some point it learned that the ground can give way and that trusting blindly is risky. ' +
      'That makes you loyal, responsible, attentive, someone who can be counted on, and at the ' +
      'same time caught in doubt: you doubt others, but you doubt yourself as well, your own ' +
      'perceptions and decisions. You look for a safe reference, an authority, a rule, a group, ' +
      'a system to lean on, and at the same time you mistrust it. Sometimes you obey, sometimes ' +
      'you rebel; sometimes you shrink from what you fear, sometimes you charge at the fear so ' +
      'as not to feel it. At the centre of it all is a question that will not be quiet: who, and ' +
      'what, is it safe to trust?',
    dorDeFundo:
      'Behind the watchfulness lives a child who did not have firm enough ground, who learned ' +
      'that support can fail and that you have to take precautions so as not to be caught off ' +
      'guard. The constant doubt is an attempt to control a danger that is, deep down, ' +
      'helplessness itself. The pain is the tiredness of never being able to rest completely, of ' +
      'turning every affection into a test and every support into a suspicion. The way back is a ' +
      'quiet courage: discovering that the security you look for so hard on the outside, in ' +
      'guarantees and authorities, only holds when it starts growing from within, from trust in ' +
      'your own capacity to handle whatever comes.',
  },
  7: {
    nome: 'Enneatype 7',
    paixao: 'Gluttony',
    fixacao: 'Planning / rationalisation',
    nucleo:
      'You have a mind that runs ahead, to the next idea, the next plan, the next brilliant ' +
      'possibility. Pain looks to you like something to be got round, and you learned to do that ' +
      'with charm, optimism and an impressive capacity for finding the good side, the way out, ' +
      'the pleasanter alternative. You like variety, novelty, keeping the doors open, because ' +
      'committing to one thing means closing all the others, and that feels tight. You are ' +
      'charming, quick, full of projects, and you know how to convince people, yourself ' +
      'included, that everything will work out. The knot is that, from anticipating so much of ' +
      'the pleasure to come, you rarely land on what is already here; the hunger never satisfies ' +
      'because the good part is always on the next plate, never on yours.',
    dorDeFundo:
      'Beneath the enthusiasm lives a child who, at some point, found the world too painful or ' +
      'too frustrating and decided to take refuge in imagination, in what could be, in a future ' +
      'always brighter than the present. The optimism is real, but it is also a way of not ' +
      'looking at pain, yours and other people’s. The deepest pain is the emptiness that appears ' +
      'when the options run out and there is nowhere left to run, the suspicion that all that ' +
      'planned abundance hides a lack that no plan fills. The way back is the hardest thing for ' +
      'you: to stay, to feel what is here, including what hurts, and to discover that the depth ' +
      'you are looking for is not in the next place, but in this one.',
  },
  8: {
    nome: 'Enneatype 8',
    paixao: 'Lust (excess, intensity)',
    fixacao: 'Vengeance',
    nucleo:
      'You learned early that the world is a place where you take or are taken from, and you ' +
      'chose to take. Beneath the hard shell everyone sees there is a core that is still a ' +
      'child, tender, who was hurt once and swore never again to be at anyone’s mercy. So you ' +
      'made yourself a fortress: intensity, a frankness that sometimes wounds, a presence that ' +
      'takes up space without asking. You go all in, in the present, in the impact, because ' +
      'feeling too much, needing too much, depending too much feels dangerous, almost like going ' +
      'back to being that defenceless child. What others call anger is, deep down, a vigil: the ' +
      'fear of being controlled, deceived or betrayed, turned into force. And the score you are ' +
      'trying to settle with life is an old one: since you were once made to swallow it, nobody ' +
      'gets to put one over on you now.',
    dorDeFundo:
      'The hardness guards what is most fragile in you: tenderness and the capacity to receive, ' +
      'locked away too early so that they would not hurt. You mistrust love precisely because ' +
      'you want it so much, because loving means giving yourself, and giving yourself means ' +
      'risking being at someone’s mercy again. That is why you push against the world all the ' +
      'time: so as not to hear the silence inside, so as not to notice that the armour, being so ' +
      'heavy, isolates you from exactly what you wanted most. The way back is not to get ' +
      'stronger, it is to let someone come close without that meaning you lose.',
  },
  9: {
    nome: 'Enneatype 9',
    paixao: 'Psychological sloth (acedia)',
    fixacao: 'Self-forgetting / going along with things',
    nucleo:
      'There is an inner fog in you, a soft way of not being entirely there. You learned early, ' +
      'without choosing it, to erase yourself: the child who had to adapt far too quickly, ' +
      'swallow her own wanting and go along so as not to be a bother. In time, wanting itself ' +
      'grew distant, almost as if it belonged to someone else. You describe yourself as ' +
      'easy-going, without strong preferences, able to adapt to anything, and that is true, but ' +
      'beneath that ease lives a forgetting: of yourself. To keep the peace on the outside, you ' +
      'put a part of the inside to sleep. And the anger that would be natural neither explodes ' +
      'nor corrects: it vanishes before you notice, dissolved in the same fog that makes ' +
      'everything seem, in the end, not that serious.',
    dorDeFundo:
      'Where your own desire should be there is an old emptiness, from a time when the love that ' +
      'would have woken in you a taste for existing was missing. Instead of looking inwards and ' +
      'searching there, you learned to fill yourself through others, through their wishes, their ' +
      'lives, their causes. The self-effacement looks like generosity, and in part it is, but it ' +
      'carries a silent request: that someone, at last, notice that you were there the whole ' +
      'time. The way back begins with a gesture that looks small and is enormous: noticing that ' +
      'you want something too, and that this will not break the peace of the world.',
  },
};

export const instintos = {
  autopreservacao: {
    nome: 'Self-preservation',
    resumo: 'Focus on physical safety, resources, comfort, routine and the body.',
  },
  social: {
    nome: 'Social',
    resumo: 'Focus on the group, belonging, hierarchy and role within the community.',
  },
  sexual: {
    nome: 'Sexual (one-to-one)',
    resumo: 'Focus on intensity, fusion and connection with one person, magnetism.',
  },
};
