
import { ResearcherRole, Scenario } from "../types";

// --- Types for Multi-Language Templates ---
type LanguageCode = 'English' | 'Chinese (Simplified)' | 'Spanish' | 'French' | 'German' | 'Japanese' | 'Portuguese';

interface LocalizedContent {
  title: string;
  description: string;
  context: string;
  navigatorSpeaking: string;
  choices: {
    text: string;
    outcomeTitle: string;
    outcomeDescription: string;
    longTermImplication: string;
    actionableStrategy: string;
    openSciencePrinciple: string;
    navigatorSpeaking: string;
  }[];
}

interface ScenarioTemplate {
  roles: ResearcherRole[];
  topic: string;
  content: Record<LanguageCode, LocalizedContent>;
}

// --- Content Templates ---

const DATA_OUTLIER_TEMPLATE: ScenarioTemplate = {
  roles: [ResearcherRole.PHD_STUDENT],
  topic: 'data',
  content: {
    'English': {
      title: "The Outlier Dilemma",
      description: "You are finalizing a graph for your first major paper. Most data points fit the hypothesis perfectly, except for two 'noisy' outliers that ruin the statistical significance (p < 0.05). Your supervisor is pressuring you to submit by Friday.",
      context: "Pressure to publish positive results is high in your lab.",
      navigatorSpeaking: "Data cleaning is standard, but removing points solely to fit a hypothesis crosses a line. Watch your Integrity.",
      choices: [
        {
          text: "Remove the outliers and don't mention them.",
          outcomeTitle: "Clean Results, Dirty Conscience",
          outcomeDescription: "The paper looks perfect and your supervisor is thrilled. However, you know the result isn't robust. You've started your career on a lie.",
          longTermImplication: "If someone tries to replicate this, they will fail, potentially exposing you later.",
          actionableStrategy: "Never manipulate data to fit a p-value. Report the outliers and discuss why they might exist.",
          openSciencePrinciple: "Transparency & Reproducibility",
          navigatorSpeaking: "A quick win, but at a heavy cost. This is how retraction scandals begin."
        },
        {
          text: "Keep the outliers but move them to 'Supplementary Materials'.",
          outcomeTitle: "Buried Truth",
          outcomeDescription: "You technically reported the data, but you obscured it to tell a cleaner story. It passes peer review, but it's not fully transparent.",
          longTermImplication: "You are learning to prioritize narrative over raw truth, a slippery slope.",
          actionableStrategy: "Be upfront about all data in the main text. Complexity often adds depth to the science.",
          openSciencePrinciple: "Full Reporting",
          navigatorSpeaking: "Better than deleting, but still hiding the full picture. Aim for total transparency."
        },
        {
          text: "Report all data points and discuss the inconsistency.",
          outcomeTitle: "Honest Complexity",
          outcomeDescription: "The results aren't significant in the way you hoped. Your supervisor is annoyed, but the paper is scientifically accurate and bulletproof.",
          longTermImplication: "You build a reputation for reliability. Future partners will trust your work implicitly.",
          actionableStrategy: "Negative or complex results are valuable. Frame them as a finding, not a failure.",
          openSciencePrinciple: "Intellectual Honesty",
          navigatorSpeaking: "This was the hard choice, but the right one. You protected the scientific record."
        }
      ]
    },
    'Chinese (Simplified)': {
      title: "异常值困境",
      description: "你正在为第一篇主要论文定稿图表。大多数数据点完美符合假设，但有两个“嘈杂”的异常值破坏了统计显著性（p < 0.05）。你的导师向你施压，要求在周五前提交。",
      context: "实验室发表阳性结果的压力很大。",
      navigatorSpeaking: "数据清洗是标准的，但仅仅为了符合假设而删除数据点越过了红线。注意你的诚信。",
      choices: [
        {
          text: "删除异常值且不提及。",
          outcomeTitle: "结果干净，良心不安",
          outcomeDescription: "论文看起来很完美，导师很高兴。但你知道结果不可靠。你的职业生涯建立在一个谎言之上。",
          longTermImplication: "如果有人试图复现，他们会失败，以后可能会通过Retraction Watch曝光你。",
          actionableStrategy: "永远不要为了迎合P值而操纵数据。报告异常值并讨论它们存在的原因。",
          openSciencePrinciple: "透明度与可复现性",
          navigatorSpeaking: "快速的胜利，但代价沉重。撤稿丑闻往往由此开始。"
        },
        {
          text: "保留异常值但移至“补充材料”。",
          outcomeTitle: "被掩埋的真相",
          outcomeDescription: "你从技术上报告了数据，但为了讲述一个更清晰的故事而将其掩盖。它通过了同行评审，但并不完全透明。",
          longTermImplication: "你正在学会将叙事置于原始真相之上，这是一个滑坡。",
          actionableStrategy: "在正文中坦诚面对所有数据。复杂性往往会增加科学的深度。",
          openSciencePrinciple: "全面报告",
          navigatorSpeaking: "比删除好，但仍然隐瞒了全貌。以此为戒，追求完全透明。"
        },
        {
          text: "报告所有数据点并讨论不一致之处。",
          outcomeTitle: "诚实的复杂性",
          outcomeDescription: "结果并不像你希望的那样显著。导师很恼火，但论文在科学上是准确且无懈可击的。",
          longTermImplication: "你建立了可靠的声誉。未来的合作伙伴将绝对信任你的工作。",
          actionableStrategy: "阴性或复杂的结果是有价值的。将它们构建为发现，而不是失败。",
          openSciencePrinciple: "理智诚实",
          navigatorSpeaking: "这是艰难的选择，也是正确的选择。你保护了科学记录。"
        }
      ]
    },
    'Spanish': {
      title: "El Dilema de los Valores Atípicos",
      description: "Estás finalizando un gráfico para tu primer artículo importante. La mayoría de los puntos de datos encajan perfectamente en la hipótesis, excepto dos valores atípicos que arruinan la significancia estadística (p < 0.05). Tu supervisor te presiona para enviar el viernes.",
      context: "La presión para publicar resultados positivos es alta en tu laboratorio.",
      navigatorSpeaking: "La limpieza de datos es estándar, pero eliminar puntos solo para ajustar una hipótesis cruza una línea.",
      choices: [
        {
          text: "Eliminar los valores atípicos sin mencionarlos.",
          outcomeTitle: "Resultados Limpios, Conciencia Sucia",
          outcomeDescription: "El artículo parece perfecto y tu supervisor está encantado. Sin embargo, sabes que el resultado no es robusto.",
          longTermImplication: "Si alguien intenta replicar esto, fallará, exponiéndote potencialmente más tarde.",
          actionableStrategy: "Nunca manipules datos para ajustar un valor p. Informa los valores atípicos y discute por qué existen.",
          openSciencePrinciple: "Transparencia y Reproducibilidad",
          navigatorSpeaking: "Una victoria rápida, pero a un alto costo."
        },
        {
          text: "Mantenerlos pero moverlos a 'Materiales Suplementarios'.",
          outcomeTitle: "Verdad Enterrada",
          outcomeDescription: "Técnicamente informaste los datos, pero los ocultaste para contar una historia más limpia.",
          longTermImplication: "Estás aprendiendo a priorizar la narrativa sobre la verdad cruda.",
          actionableStrategy: "Sé directo sobre todos los datos en el texto principal.",
          openSciencePrinciple: "Informe Completo",
          navigatorSpeaking: "Mejor que borrar, pero aún ocultando la imagen completa."
        },
        {
          text: "Informar todos los puntos y discutir la inconsistencia.",
          outcomeTitle: "Complejidad Honesta",
          outcomeDescription: "Los resultados no son significativos como esperabas. Tu supervisor está molesto, pero el artículo es científicamente preciso.",
          longTermImplication: "Construyes una reputación de confiabilidad.",
          actionableStrategy: "Los resultados negativos o complejos son valiosos.",
          openSciencePrinciple: "Honestidad Intelectual",
          navigatorSpeaking: "Fue la elección difícil, pero la correcta."
        }
      ]
    },
    'French': {
      title: "Le Dilemme des Valeurs Aberrantes",
      description: "Vous finalisez un graphique pour votre premier grand article. La plupart des données correspondent parfaitement à l'hypothèse, sauf deux valeurs aberrantes qui ruinent la signification statistique (p < 0,05). Votre directeur vous met la pression pour soumettre d'ici vendredi.",
      context: "La pression pour publier des résultats positifs est forte.",
      navigatorSpeaking: "Le nettoyage des données est normal, mais supprimer des points uniquement pour correspondre à une hypothèse est inacceptable.",
      choices: [
        {
          text: "Supprimer les valeurs aberrantes sans les mentionner.",
          outcomeTitle: "Résultats Propres, Conscience Sale",
          outcomeDescription: "L'article semble parfait. Cependant, vous savez que le résultat n'est pas robuste.",
          longTermImplication: "Si quelqu'un essaie de reproduire cela, il échouera, ce qui pourrait vous exposer plus tard.",
          actionableStrategy: "Ne manipulez jamais les données pour ajuster une valeur p.",
          openSciencePrinciple: "Transparence et Reproductibilité",
          navigatorSpeaking: "Une victoire rapide, mais à un prix élevé."
        },
        {
          text: "Les garder mais les déplacer dans les 'Documents Supplémentaires'.",
          outcomeTitle: "Vérité Enterrée",
          outcomeDescription: "Vous avez techniquement rapporté les données, mais vous les avez obscurcies pour raconter une histoire plus propre.",
          longTermImplication: "Vous apprenez à prioriser la narration sur la vérité brute.",
          actionableStrategy: "Soyez franc au sujet de toutes les données dans le texte principal.",
          openSciencePrinciple: "Rapport Complet",
          navigatorSpeaking: "Mieux que de supprimer, mais cache toujours l'image complète."
        },
        {
          text: "Rapporter tous les points et discuter de l'incohérence.",
          outcomeTitle: "Complexité Honnête",
          outcomeDescription: "Les résultats ne sont pas significatifs comme vous l'espériez. Votre directeur est agacé, mais l'article est précis.",
          longTermImplication: "Vous construisez une réputation de fiabilité.",
          actionableStrategy: "Les résultats négatifs ou complexes sont précieux.",
          openSciencePrinciple: "Honnêteté Intellectuelle",
          navigatorSpeaking: "C'était le choix difficile, mais le bon."
        }
      ]
    },
    'German': {
      title: "Das Ausreißer-Dilemma",
      description: "Sie stellen eine Grafik für Ihre erste große Arbeit fertig. Die meisten Datenpunkte passen perfekt zur Hypothese, bis auf zwei 'verrauschte' Ausreißer, die die statistische Signifikanz (p < 0,05) ruinieren. Ihr Betreuer drängt auf Einreichung bis Freitag.",
      context: "Der Druck, positive Ergebnisse zu veröffentlichen, ist hoch.",
      navigatorSpeaking: "Datenbereinigung ist Standard, aber das Entfernen von Punkten nur zur Anpassung an eine Hypothese überschreitet eine Grenze.",
      choices: [
        {
          text: "Die Ausreißer entfernen und nicht erwähnen.",
          outcomeTitle: "Saubere Ergebnisse, Schmutziges Gewissen",
          outcomeDescription: "Die Arbeit sieht perfekt aus. Sie wissen jedoch, dass das Ergebnis nicht robust ist.",
          longTermImplication: "Wenn jemand versucht, dies zu replizieren, wird er scheitern.",
          actionableStrategy: "Manipulieren Sie niemals Daten, um einen p-Wert anzupassen.",
          openSciencePrinciple: "Transparenz & Reproduzierbarkeit",
          navigatorSpeaking: "Ein schneller Sieg, aber zu einem hohen Preis."
        },
        {
          text: "Behalten, aber in das 'Supplementary Material' verschieben.",
          outcomeTitle: "Begrabene Wahrheit",
          outcomeDescription: "Sie haben die Daten technisch gemeldet, aber verschleiert.",
          longTermImplication: "Sie lernen, die Erzählung über die reine Wahrheit zu stellen.",
          actionableStrategy: "Seien Sie im Haupttext offen über alle Daten.",
          openSciencePrinciple: "Vollständige Berichterstattung",
          navigatorSpeaking: "Besser als löschen, aber immer noch verstecken."
        },
        {
          text: "Alle Punkte melden und die Inkonsistenz diskutieren.",
          outcomeTitle: "Ehrliche Komplexität",
          outcomeDescription: "Die Ergebnisse sind nicht signifikant wie erhofft. Aber die Arbeit ist wissenschaftlich korrekt.",
          longTermImplication: "Sie bauen einen Ruf für Zuverlässigkeit auf.",
          actionableStrategy: "Negative oder komplexe Ergebnisse sind wertvoll.",
          openSciencePrinciple: "Intellektuelle Ehrlichkeit",
          navigatorSpeaking: "Das war die harte Wahl, aber die richtige."
        }
      ]
    },
    'Japanese': {
      title: "外れ値のジレンマ",
      description: "あなたは最初の主要論文のグラフを完成させようとしています。ほとんどのデータポイントは仮説と完全に一致していますが、統計的有意性（p < 0.05）を台無しにする2つの「ノイズの多い」外れ値があります。指導教官は金曜日までの提出を求めています。",
      context: "研究室では肯定的な結果を発表する圧力が高いです。",
      navigatorSpeaking: "データのクリーニングは標準的ですが、仮説に合わせるためだけにポイントを削除するのは一線を越えています。",
      choices: [
        {
          text: "外れ値を削除し、言及しない。",
          outcomeTitle: "きれいな結果、汚れた良心",
          outcomeDescription: "論文は完璧に見え、指導教官も大喜びです。しかし、結果が堅牢でないことをあなたは知っています。嘘からキャリアを始めました。",
          longTermImplication: "誰かがこれを再現しようとすると失敗し、後であなたが暴露される可能性があります。",
          actionableStrategy: "P値を合わせるためにデータを操作しないでください。外れ値を報告し、その理由を議論してください。",
          openSciencePrinciple: "透明性と再現性",
          navigatorSpeaking: "手っ取り早い勝利ですが、代償は大きいです。"
        },
        {
          text: "保持するが、「補足資料」に移動する。",
          outcomeTitle: "埋もれた真実",
          outcomeDescription: "技術的にはデータを報告しましたが、よりきれいなストーリーを語るためにそれを隠しました。",
          longTermImplication: "生の真実よりも物語を優先することを学んでいます。",
          actionableStrategy: "本文ですべてのデータについて率直に述べてください。",
          openSciencePrinciple: "完全な報告",
          navigatorSpeaking: "削除するよりはましですが、それでも全体像を隠しています。"
        },
        {
          text: "すべてのデータポイントを報告し、不整合を議論する。",
          outcomeTitle: "正直な複雑さ",
          outcomeDescription: "結果は期待したほど有意ではありません。指導教官はイライラしていますが、論文は科学的に正確です。",
          longTermImplication: "信頼できるという評判を築きます。",
          actionableStrategy: "否定的または複雑な結果には価値があります。",
          openSciencePrinciple: "知的誠実さ",
          navigatorSpeaking: "それは難しい選択でしたが、正しい選択でした。"
        }
      ]
    },
    'Portuguese': {
      title: "O Dilema dos Valores Atípicos",
      description: "Você está finalizando um gráfico para seu primeiro grande artigo. A maioria dos pontos se encaixa perfeitamente na hipótese, exceto dois valores atípicos que arruinam a significância estatística (p < 0.05). Seu orientador pressiona para enviar até sexta-feira.",
      context: "A pressão para publicar resultados positivos é alta.",
      navigatorSpeaking: "Limpeza de dados é normal, mas remover pontos apenas para ajustar uma hipótese cruza um limite.",
      choices: [
        {
          text: "Remover os valores atípicos sem mencionar.",
          outcomeTitle: "Resultados Limpos, Consciência Suja",
          outcomeDescription: "O artigo parece perfeito. No entanto, você sabe que o resultado não é robusto.",
          longTermImplication: "Se alguém tentar replicar isso, falhará.",
          actionableStrategy: "Nunca manipule dados para ajustar um valor p.",
          openSciencePrinciple: "Transparência e Reprodutibilidade",
          navigatorSpeaking: "Uma vitória rápida, mas a um custo alto."
        },
        {
          text: "Mantê-los, mas mover para 'Materiais Suplementarios'.",
          outcomeTitle: "Verdade Enterrada",
          outcomeDescription: "Você tecnicamente relatou os dados, mas os obscureceu para contar uma história mais limpa.",
          longTermImplication: "Você está aprendendo a priorizar a narrativa sobre a verdade nua e crua.",
          actionableStrategy: "Seja direto sobre todos os dados no texto principal.",
          openSciencePrinciple: "Relato Completo",
          navigatorSpeaking: "Melhor que apagar, mas ainda escondendo a imagem completa."
        },
        {
          text: "Relatar todos os pontos e discutir a inconsistência.",
          outcomeTitle: "Complexidade Honesta",
          outcomeDescription: "Os resultados não são significativos como esperado. Mas o artigo é cientificamente preciso.",
          longTermImplication: "Você constrói uma reputação de confiabilidade.",
          actionableStrategy: "Resultados negativos ou complexos são valiosos.",
          openSciencePrinciple: "Honestidade Intelectual",
          navigatorSpeaking: "Foi a escolha difícil, mas a correta."
        }
      ]
    }
  }
};

const GIFT_AUTHORSHIP_TEMPLATE: ScenarioTemplate = {
  roles: [ResearcherRole.POSTDOC],
  topic: 'authorship',
  content: {
    'English': {
      title: "The Phantom Author",
      description: "You are submitting a paper to a top journal. Your PI suggests adding a famous professor from another university as a co-author, even though they didn't contribute, to 'increase acceptance chances'.",
      context: "Gift authorship is a corrupt practice used to game the system.",
      navigatorSpeaking: "This is 'Gift Authorship'. It corrupts the scientific record and dilutes credit.",
      choices: [
        {
          text: "Add the name. It helps the paper get accepted.",
          outcomeTitle: "Political Maneuvering",
          outcomeDescription: "The paper gets accepted, possibly due to the name. You learn that connections matter more than merit.",
          longTermImplication: "You perpetuate a system of nepotism. Your actual contributors might feel resentful.",
          actionableStrategy: "Authorship must be based on substantial contribution (ICMJE guidelines).",
          openSciencePrinciple: "Accountability",
          navigatorSpeaking: "You traded integrity for prestige. A common trap."
        },
        {
          text: "Refuse politely, citing journal guidelines.",
          outcomeTitle: "Standing Your Ground",
          outcomeDescription: "Your PI is irritated, and the paper might face tougher review. But the author list is honest.",
          longTermImplication: "You establish yourself as a serious researcher who can't be pushed around.",
          actionableStrategy: "Suggest acknowledging the professor in the 'Acknowledgements' section instead.",
          openSciencePrinciple: "Fair Credit",
          navigatorSpeaking: "Brave. Protecting the definition of authorship is vital for science."
        },
        {
          text: "Ask the professor to actually contribute something small now.",
          outcomeTitle: "Retroactive Justification",
          outcomeDescription: "They read the draft and fix two typos. Technically they contributed, but it's borderline.",
          longTermImplication: "You found a loophole. It works, but it's cynical.",
          actionableStrategy: "Plan collaborations early, don't bolt them on for prestige.",
          openSciencePrinciple: "Collaboration",
          navigatorSpeaking: "A pragmatic compromise, but still ethically murky."
        }
      ]
    },
    'Chinese (Simplified)': {
      title: "幽灵作者",
      description: "你正在向顶级期刊投稿。你的PI建议添加一位来自另一所大学的著名教授作为合著者，即使他们没有做出贡献，以“增加接收机会”。",
      context: "挂名作者是一种破坏系统的腐败做法。",
      navigatorSpeaking: "这是“挂名作者”。它腐蚀了科学记录并稀释了功劳。",
      choices: [
        {
          text: "添加名字。这有助于论文被接收。",
          outcomeTitle: "政治手段",
          outcomeDescription: "论文被接收了。你了解到人脉比能力更重要。",
          longTermImplication: "你延续了裙带关系的制度。",
          actionableStrategy: "作者身份必须基于实质性贡献（ICMJE指南）。",
          openSciencePrinciple: "问责制",
          navigatorSpeaking: "你用诚信换取了声望。一个常见的陷阱。"
        },
        {
          text: "礼貌拒绝，引用期刊指南。",
          outcomeTitle: "坚持立场",
          outcomeDescription: "PI很恼火。但作者名单是诚实的。",
          longTermImplication: "你确立了自己作为一个严肃研究者的地位。",
          actionableStrategy: "建议在“致谢”部分感谢该教授。",
          openSciencePrinciple: "公平归功",
          navigatorSpeaking: "勇敢。保护作者身份的定义对科学至关重要。"
        },
        {
          text: "请教授现在实际贡献一点点。",
          outcomeTitle: "事后合理化",
          outcomeDescription: "他们读了草稿并修改了两个拼写错误。技术上他们贡献了，但这很勉强。",
          longTermImplication: "你找到了一个漏洞。这很愤世嫉俗。",
          actionableStrategy: "尽早规划合作，不要为了声望而强行添加。",
          openSciencePrinciple: "合作",
          navigatorSpeaking: "一个务实的妥协，但在道德上仍然模糊。"
        }
      ]
    },
    'Spanish': {
      title: "El Autor Fantasma",
      description: "Estás enviando un artículo. Tu IP sugiere añadir a un profesor famoso como coautor, aunque no contribuyó, para 'aumentar las posibilidades'.",
      context: "La autoría de regalo es una práctica corrupta.",
      navigatorSpeaking: "Esto es 'Autoría de Regalo'. Corrompe el registro científico.",
      choices: [
        {
          text: "Añadir el nombre.",
          outcomeTitle: "Maniobra Política",
          outcomeDescription: "El artículo es aceptado. Aprendes que las conexiones importan más que el mérito.",
          longTermImplication: "Perpetúas un sistema de nepotismo.",
          actionableStrategy: "La autoría debe basarse en una contribución sustancial.",
          openSciencePrinciple: "Responsabilidad",
          navigatorSpeaking: "Cambiaste integridad por prestigio."
        },
        {
          text: "Rechazar cortésmente.",
          outcomeTitle: "Mantener tu Posición",
          outcomeDescription: "Tu IP está irritado. Pero la lista de autores es honesta.",
          longTermImplication: "Te estableces como un investigador serio.",
          actionableStrategy: "Sugiere agradecer al profesor en los 'Agradecimientos'.",
          openSciencePrinciple: "Crédito Justo",
          navigatorSpeaking: "Valiente. Proteger la autoría es vital."
        },
        {
          text: "Pedir al profesor que contribuya algo pequeño ahora.",
          outcomeTitle: "Justificación Retroactiva",
          outcomeDescription: "Leen el borrador y arreglan errores. Técnicamente contribuyeron.",
          longTermImplication: "Encontraste un vacío legal.",
          actionableStrategy: "Planifica colaboraciones temprano.",
          openSciencePrinciple: "Colaboración",
          navigatorSpeaking: "Un compromiso pragmático, pero éticamente turbio."
        }
      ]
    },
    'French': {
      title: "L'Auteur Fantôme",
      description: "Vous soumettez un article. Votre directeur suggère d'ajouter un professeur célèbre comme co-auteur, même s'il n'a pas contribué, pour 'augmenter les chances'.",
      context: "L'auteur de complaisance est une pratique corrompue.",
      navigatorSpeaking: "C'est de l'autorship de complaisance. Cela corrompt le dossier scientifique.",
      choices: [
        {
          text: "Ajouter le nom.",
          outcomeTitle: "Manœuvre Politique",
          outcomeDescription: "L'article est accepté. Vous apprenez que les relations comptent plus que le mérite.",
          longTermImplication: "Vous perpétuez un système de népotisme.",
          actionableStrategy: "L'auteur doit avoir contribué substantiellement.",
          openSciencePrinciple: "Responsabilité",
          navigatorSpeaking: "Vous avez échangé l'intégrité contre le prestige."
        },
        {
          text: "Refuser poliment.",
          outcomeTitle: "Tenir Bon",
          outcomeDescription: "Votre directeur est irrité. Mais la liste des auteurs est honnête.",
          longTermImplication: "Vous vous établissez comme un chercheur sérieux.",
          actionableStrategy: "Suggérez de remercier le professeur dans les remerciements.",
          openSciencePrinciple: "Crédit Équitable",
          navigatorSpeaking: "Courageux. Protéger l'autorship est vital."
        },
        {
          text: "Demander au professeur de contribuer un peu maintenant.",
          outcomeTitle: "Justification Rétroactive",
          outcomeDescription: "Il corrige des fautes. Techniquement il a contribué.",
          longTermImplication: "Vous avez trouvé une faille.",
          actionableStrategy: "Planifiez les collaborations tôt.",
          openSciencePrinciple: "Collaboration",
          navigatorSpeaking: "Un compromis pragmatique, mais trouble."
        }
      ]
    },
    'German': {
      title: "Der Phantomautor",
      description: "Sie reichen eine Arbeit ein. Ihr PI schlägt vor, einen berühmten Professor als Koautor hinzuzufügen, um die 'Akzeptanzchancen zu erhöhen'.",
      context: "Geschenkartikelschaft ist eine korrupte Praxis.",
      navigatorSpeaking: "Dies ist 'Geschenkartikelschaft'. Sie korrumpiert die Wissenschaft.",
      choices: [
        {
          text: "Namen hinzufügen.",
          outcomeTitle: "Politisches Manöver",
          outcomeDescription: "Die Arbeit wird akzeptiert. Sie lernen, dass Beziehungen zählen.",
          longTermImplication: "Sie verewigen ein System der Vetternwirtschaft.",
          actionableStrategy: "Autorschaft muss auf substanziellem Beitrag beruhen.",
          openSciencePrinciple: "Verantwortlichkeit",
          navigatorSpeaking: "Integrität gegen Prestige getauscht."
        },
        {
          text: "Höflich ablehnen.",
          outcomeTitle: "Standhaft bleiben",
          outcomeDescription: "Ihr PI ist irritiert. Aber die Autorenliste ist ehrlich.",
          longTermImplication: "Sie etablieren sich als ernsthafter Forscher.",
          actionableStrategy: "Schlagen Sie vor, dem Professor in der Danksagung zu danken.",
          openSciencePrinciple: "Faire Anerkennung",
          navigatorSpeaking: "Mutig. Schutz der Autorschaft ist vital."
        },
        {
          text: "Professor bitten, jetzt etwas beizutragen.",
          outcomeTitle: "Rückwirkende Rechtfertigung",
          outcomeDescription: "Er korrigiert Fehler. Technisch gesehen ein Beitrag.",
          longTermImplication: "Sie haben ein Schlupfloch gefunden.",
          actionableStrategy: "Planen Sie Kollaborationen frühzeitig.",
          openSciencePrinciple: "Zusammenarbeit",
          navigatorSpeaking: "Ein pragmatischer Kompromiss, aber ethisch trübe."
        }
      ]
    },
    'Japanese': {
      title: "幽霊著者",
      description: "論文を投稿するところです。PIは、貢献していないにもかかわらず、有名な教授を共著者として追加することを提案しています。",
      context: "ギフトオーサーシップは腐敗した慣行です。",
      navigatorSpeaking: "これは「ギフトオーサーシップ」です。科学的記録を腐敗させます。",
      choices: [
        {
          text: "名前を追加する。",
          outcomeTitle: "政治的策略",
          outcomeDescription: "論文は受理されました。実力よりもコネが重要だと学びます。",
          longTermImplication: "縁故主義のシステムを永続させます。",
          actionableStrategy: "著者は実質的な貢献に基づくべきです。",
          openSciencePrinciple: "説明責任",
          navigatorSpeaking: "誠実さを名声と交換しました。"
        },
        {
          text: "丁重に断る。",
          outcomeTitle: "立場を貫く",
          outcomeDescription: "PIはイライラしています。しかし、著者リストは正直です。",
          longTermImplication: "真面目な研究者としての地位を確立します。",
          actionableStrategy: "謝辞セクションで教授に感謝することを提案します。",
          openSciencePrinciple: "公正な信用",
          navigatorSpeaking: "勇敢です。著者の定義を守ることは不可欠です。"
        },
        {
          text: "教授に今、少し貢献してもらう。",
          outcomeTitle: "遡及的正当化",
          outcomeDescription: "彼らは誤字を修正しました。技術的には貢献しましたが、ギリギリです。",
          longTermImplication: "抜け穴を見つけました。",
          actionableStrategy: "共同研究は早期に計画してください。",
          openSciencePrinciple: "コラボレーション",
          navigatorSpeaking: "実用的な妥協ですが、倫理的には濁っています。"
        }
      ]
    },
    'Portuguese': {
      title: "O Autor Fantasma",
      description: "Você está enviando um artigo. Seu IP sugere adicionar um professor famoso como coautor, mesmo sem contribuição, para 'aumentar as chances'.",
      context: "Autoria de presente é uma prática corrupta.",
      navigatorSpeaking: "Isso é 'Autoria de Presente'. Corrompe o registro científico.",
      choices: [
        {
          text: "Adicionar o nome.",
          outcomeTitle: "Manobra Política",
          outcomeDescription: "O artigo é aceito. Você aprende que conexões importam mais que mérito.",
          longTermImplication: "Você perpetua um sistema de nepotismo.",
          actionableStrategy: "Autoria deve ser baseada em contribuição substancial.",
          openSciencePrinciple: "Responsabilidade",
          navigatorSpeaking: "Trocou integridade por prestígio."
        },
        {
          text: "Recusar educadamente.",
          outcomeTitle: "Manter sua Posição",
          outcomeDescription: "Seu IP está irritado. Mas a lista de autores é honesta.",
          longTermImplication: "Você se estabelece como um pesquisador sério.",
          actionableStrategy: "Sugira agradecer ao professor nos 'Agradecimentos'.",
          openSciencePrinciple: "Crédito Justo",
          navigatorSpeaking: "Corajoso. Proteger a autoria é vital."
        },
        {
          text: "Pedir ao professor para contribuir algo agora.",
          outcomeTitle: "Justificativa Retroativa",
          outcomeDescription: "Eles corrigem erros. Tecnicamente contribuíram.",
          longTermImplication: "Você encontrou uma brecha.",
          actionableStrategy: "Planeje colaborações cedo.",
          openSciencePrinciple: "Colaboração",
          navigatorSpeaking: "Um compromisso pragmático, mas eticamente turvo."
        }
      ]
    }
  }
};

const PI_COI_TEMPLATE: ScenarioTemplate = {
  roles: [ResearcherRole.PRINCIPAL_INVESTIGATOR, ResearcherRole.FULL_PROFESSOR],
  topic: 'coi',
  content: {
    'English': {
      title: "The Friendly Review",
      description: "You are invited to peer review a grant proposal. You realize it is written by a close former colleague. The proposal is mediocre, but you know they desperately need the funding to keep their lab open.",
      context: "Conflicts of interest challenge impartiality.",
      navigatorSpeaking: "Personal loyalty vs professional duty. This is a classic Conflict of Interest (COI).",
      choices: [
        {
          text: "Review it positively to help your friend.",
          outcomeTitle: "Bias & Nepotism",
          outcomeDescription: "They get the money. A better proposal from a stranger was rejected because of your bias.",
          longTermImplication: "You are eroding trust in the funding system.",
          actionableStrategy: "Recuse yourself immediately if you cannot be impartial.",
          openSciencePrinciple: "Impartiality",
          navigatorSpeaking: "You helped a friend but hurt science."
        },
        {
          text: "Review it harshly to prove you aren't biased.",
          outcomeTitle: "Overcompensation",
          outcomeDescription: "You were unfairly critical. Your friend loses the grant and their lab suffers unnecessarily.",
          longTermImplication: "Your judgment is still clouded by the relationship.",
          actionableStrategy: "Declare the COI and let the editor decide.",
          openSciencePrinciple: "Fairness",
          navigatorSpeaking: "Bias works both ways. You were still not objective."
        },
        {
          text: "Decline the review, stating a Conflict of Interest.",
          outcomeTitle: "Professional Integrity",
          outcomeDescription: "The agency finds a neutral reviewer. The proposal is judged on merit.",
          longTermImplication: "You maintain the integrity of the peer review system.",
          actionableStrategy: "Always disclose COIs upfront.",
          openSciencePrinciple: "Transparency",
          navigatorSpeaking: "The only correct professional choice."
        }
      ]
    },
    'Chinese (Simplified)': {
      title: "友好的评审",
      description: "你受邀评审一份资助申请。你发现这是由一位亲密的前同事写的。申请很平庸，但你知道他们迫切需要资金来维持实验室的运作。",
      context: "利益冲突挑战公正性。",
      navigatorSpeaking: "个人忠诚与职业责任。这是典型的利益冲突（COI）。",
      choices: [
        {
          text: "给予正面评价以帮助朋友。",
          outcomeTitle: "偏见与裙带关系",
          outcomeDescription: "他们得到了钱。因为你的偏见，一份来自陌生人的更好申请被拒绝了。",
          longTermImplication: "你正在侵蚀对资助体系的信任。",
          actionableStrategy: "如果不能公正，请立即回避。",
          openSciencePrinciple: "公正性",
          navigatorSpeaking: "你帮了朋友，但伤害了科学。"
        },
        {
          text: "严厉评审以证明你没有偏见。",
          outcomeTitle: "过度补偿",
          outcomeDescription: "你批评得不公平。你的朋友失去了资助，实验室受到了不必要的损失。",
          longTermImplication: "你的判断仍然被关系所蒙蔽。",
          actionableStrategy: "声明COI并让编辑决定。",
          openSciencePrinciple: "公平",
          navigatorSpeaking: "偏见是双向的。你仍然不客观。"
        },
        {
          text: "拒绝评审，声明利益冲突。",
          outcomeTitle: "职业诚信",
          outcomeDescription: "机构找到了一位中立的评审员。申请根据其优点进行评判。",
          longTermImplication: "你维护了同行评审体系的完整性。",
          actionableStrategy: "始终预先披露COI。",
          openSciencePrinciple: "透明度",
          navigatorSpeaking: "唯一正确的职业选择。"
        }
      ]
    },
    'Spanish': {
      title: "La Revisión Amistosa",
      description: "Te invitan a revisar una propuesta. Es de un amigo cercano. La propuesta es mediocre, pero necesitan los fondos.",
      context: "El conflicto de interés desafía la imparcialidad.",
      navigatorSpeaking: "Lealtad personal vs deber profesional. Un COI clásico.",
      choices: [
        {
          text: "Revisar positivamente para ayudar.",
          outcomeTitle: "Sesgo y Nepotismo",
          outcomeDescription: "Obtienen el dinero. Una propuesta mejor fue rechazada.",
          longTermImplication: "Erosionas la confianza en el sistema.",
          actionableStrategy: "Recúsate si no puedes ser imparcial.",
          openSciencePrinciple: "Imparcialidad",
          navigatorSpeaking: "Ayudaste a un amigo pero dañaste la ciencia."
        },
        {
          text: "Revisar duramente para probar objetividad.",
          outcomeTitle: "Sobrecompensación",
          outcomeDescription: "Fuiste injustamente crítico. Tu juicio está nublado.",
          longTermImplication: "Tu juicio sigue afectado.",
          actionableStrategy: "Declara el COI.",
          openSciencePrinciple: "Justicia",
          navigatorSpeaking: "Aún no fuiste objetivo."
        },
        {
          text: "Rechazar la revisión por Conflicto de Interés.",
          outcomeTitle: "Integridad Profesional",
          outcomeDescription: "La agencia encuentra un revisor neutral.",
          longTermImplication: "Mantienes la integridad del sistema.",
          actionableStrategy: "Siempre divulga los COI.",
          openSciencePrinciple: "Transparencia",
          navigatorSpeaking: "La única elección correcta."
        }
      ]
    },
    'French': {
      title: "La Révision Amicale",
      description: "Vous révisez une proposition d'un ami proche. Elle est médiocre, mais il a besoin de fonds.",
      context: "Le conflit d'intérêts défie l'impartialité.",
      navigatorSpeaking: "Loyauté personnelle vs devoir professionnel.",
      choices: [
        {
          text: "Réviser positivement pour aider.",
          outcomeTitle: "Biais et Népotisme",
          outcomeDescription: "Ils obtiennent l'argent. Une meilleure proposition a été rejetée.",
          longTermImplication: "Vous érodez la confiance.",
          actionableStrategy: "Récusez-vous si vous ne pouvez pas être impartial.",
          openSciencePrinciple: "Impartialité",
          navigatorSpeaking: "Vous avez aidé un ami mais blessé la science."
        },
        {
          text: "Réviser durement pour prouver l'objectivité.",
          outcomeTitle: "Surcompensation",
          outcomeDescription: "Vous avez été injustement critique.",
          longTermImplication: "Votre jugement est troublé.",
          actionableStrategy: "Déclarez le conflit d'intérêts.",
          openSciencePrinciple: "Équité",
          navigatorSpeaking: "Pas objectif."
        },
        {
          text: "Décliner pour Conflit d'Intérêts.",
          outcomeTitle: "Intégrité Professionnelle",
          outcomeDescription: "L'agence trouve un réviseur neutre.",
          longTermImplication: "Vous maintenez l'intégrité.",
          actionableStrategy: "Divulguez toujours les conflits.",
          openSciencePrinciple: "Transparence",
          navigatorSpeaking: "Le seul choix correct."
        }
      ]
    },
    'German': {
      title: "Die freundliche Überprüfung",
      description: "Sie überprüfen den Antrag eines Freundes. Er ist mittelmäßig, aber er braucht das Geld.",
      context: "Interessenkonflikt fordert Unparteilichkeit heraus.",
      navigatorSpeaking: "Persönliche Loyalität vs. Berufspflicht.",
      choices: [
        {
          text: "Positiv bewerten, um zu helfen.",
          outcomeTitle: "Voreingenommenheit",
          outcomeDescription: "Sie bekommen das Geld. Bessere Forschung wurde abgelehnt.",
          longTermImplication: "Sie untergraben das Vertrauen.",
          actionableStrategy: "Lehnen Sie ab, wenn Sie nicht unparteiisch sind.",
          openSciencePrinciple: "Unparteilichkeit",
          navigatorSpeaking: "Freund geholfen, Wissenschaft geschadet."
        },
        {
          text: "Hart bewerten als Beweis.",
          outcomeTitle: "Überkompensation",
          outcomeDescription: "Sie waren unfair kritisch.",
          longTermImplication: "Urteil ist getrübt.",
          actionableStrategy: "Erklären Sie den Konflikt.",
          openSciencePrinciple: "Fairness",
          navigatorSpeaking: "Nicht objektiv."
        },
        {
          text: "Wegen Interessenkonflikt ablehnen.",
          outcomeTitle: "Professionelle Integrität",
          outcomeDescription: "Ein neutraler Gutachter wird gefunden.",
          longTermImplication: "Sie wahren die Integrität.",
          actionableStrategy: "Legen Sie Konflikte offen.",
          openSciencePrinciple: "Transparenz",
          navigatorSpeaking: "Die einzig richtige Wahl."
        }
      ]
    },
    'Japanese': {
      title: "友好的な査読",
      description: "親しい友人の助成金申請を査読しています。内容は平凡ですが、彼らは資金を必要としています。",
      context: "利益相反は公平性に挑戦します。",
      navigatorSpeaking: "個人的な忠誠心対職業的義務。典型的な利益相反（COI）です。",
      choices: [
        {
          text: "助けるために肯定的に査読する。",
          outcomeTitle: "偏見と縁故",
          outcomeDescription: "彼らは資金を得ます。より良い提案が拒否されました。",
          longTermImplication: "信頼を損なっています。",
          actionableStrategy: "公平になれない場合は辞退してください。",
          openSciencePrinciple: "公平性",
          navigatorSpeaking: "友人を助けましたが、科学を傷つけました。"
        },
        {
          text: "客観性を証明するために厳しく査読する。",
          outcomeTitle: "過剰補償",
          outcomeDescription: "不当に批判的でした。",
          longTermImplication: "判断が曇っています。",
          actionableStrategy: "COIを宣言してください。",
          openSciencePrinciple: "公正",
          navigatorSpeaking: "客観的ではありませんでした。"
        },
        {
          text: "利益相反を理由に辞退する。",
          outcomeTitle: "職業的誠実さ",
          outcomeDescription: "中立的な査読者が見つかります。",
          longTermImplication: "完全性を維持します。",
          actionableStrategy: "常にCOIを開示してください。",
          openSciencePrinciple: "透明性",
          navigatorSpeaking: "唯一の正しい選択です。"
        }
      ]
    },
    'Portuguese': {
      title: "A Revisão Amigável",
      description: "Você revisa a proposta de um amigo. É medíocre, mas eles precisam do dinheiro.",
      context: "Conflito de interesses desafia a imparcialidade.",
      navigatorSpeaking: "Lealdade pessoal vs dever profissional.",
      choices: [
        {
          text: "Revisar positivamente para ajudar.",
          outcomeTitle: "Viés e Nepotismo",
          outcomeDescription: "Eles recebem o dinheiro. Uma proposta melhor foi rejeitada.",
          longTermImplication: "Você corrói a confiança.",
          actionableStrategy: "Recuse-se se não puder ser imparcial.",
          openSciencePrinciple: "Imparcialidade",
          navigatorSpeaking: "Ajudou um amigo, feriu a ciência."
        },
        {
          text: "Revisar duramente para provar isenção.",
          outcomeTitle: "Sobrecompensação",
          outcomeDescription: "Você foi injustamente crítico.",
          longTermImplication: "Seu julgamento está nublado.",
          actionableStrategy: "Declare o conflito.",
          openSciencePrinciple: "Justiça",
          navigatorSpeaking: "Não foi objetivo."
        },
        {
          text: "Recusar por Conflito de Interesses.",
          outcomeTitle: "Integridade Profissional",
          outcomeDescription: "Um revisor neutro é encontrado.",
          longTermImplication: "Você mantém a integridade.",
          actionableStrategy: "Sempre divulgue conflitos.",
          openSciencePrinciple: "Transparência",
          navigatorSpeaking: "A única escolha correta."
        }
      ]
    }
  }
};

const TEMPLATES = [DATA_OUTLIER_TEMPLATE, GIFT_AUTHORSHIP_TEMPLATE, PI_COI_TEMPLATE];

export const SEED_SCENARIOS: { role: ResearcherRole; topic: string; language: string; scenario: Scenario }[] = [];

// Flatten templates into the export array
TEMPLATES.forEach(template => {
  template.roles.forEach(role => {
    Object.entries(template.content).forEach(([lang, content]) => {
      // Map simplified localized choices to full ScenarioChoice objects with outcomes
      const choices = content.choices.map((c, index) => ({
        id: `seed_${template.topic}_${index}`,
        text: c.text,
        outcome: {
          outcomeTitle: c.outcomeTitle,
          outcomeDescription: c.outcomeDescription,
          // Fixed score impacts for consistency across languages
          integrityScoreChange: index === 0 ? -10 : (index === 1 ? -5 : 10),
          careerScoreChange: index === 0 ? 5 : (index === 1 ? 2 : -2),
          rigorScoreChange: index === 0 ? -10 : (index === 1 ? -5 : 10),
          collaborationScoreChange: index === 0 ? -5 : (index === 1 ? 0 : 5),
          wellbeingScoreChange: index === 0 ? -5 : (index === 1 ? -2 : 5),
          
          longTermImplication: c.longTermImplication,
          actionableStrategy: c.actionableStrategy,
          openSciencePrinciple: c.openSciencePrinciple,
          navigatorSpeaking: c.navigatorSpeaking
        }
      }));

      SEED_SCENARIOS.push({
        role: role,
        topic: template.topic,
        language: lang,
        scenario: {
          title: content.title,
          description: content.description,
          context: content.context,
          navigatorSpeaking: content.navigatorSpeaking,
          choices: choices
        }
      });
    });
  });
});
