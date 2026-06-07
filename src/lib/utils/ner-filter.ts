/**
 * Filtre d'Anonymisation NER (Named Entity Recognition) pour la protection des PII.
 * Conforme à la Loi RDC n° 20/017 sur la protection des données personnelles.
 * Permet d'anonymiser les données sensibles localement avant envoi aux LLMs
 * et de les restaurer à la réception de la réponse (dé-anonymisation).
 */
export class NerAnonymizer {
  // Regex de détection des numéros congolais (+243...) et internationaux
  private static PHONE_REGEX = /(?:\+243|0)[89][0-9]{8}\b/g;
  
  // Regex de détection des emails
  private static EMAIL_REGEX = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}\b/g;
  
  // Regex de détection des montants financiers (CDF, USD, $)
  private static MONEY_REGEX = /\b\d{1,3}(?:[.,\s]\d{3})*(?:\s?(?:CDF|USD|\$|dollars?|francs?))\b/gi;

  /**
   * Anonymise les informations personnelles identifiables (PII) d'un texte.
   * Remplace les numéros de téléphone, emails et montants financiers par des tokens réversibles.
   */
  public static anonymize(text: string): { anonymizedText: string; mapping: Record<string, string> } {
    if (!text) return { anonymizedText: "", mapping: {} };

    const mapping: Record<string, string> = {};
    let anonymizedText = text;
    let tokenIndex = 1;

    // 1. Anonymiser les numéros de téléphone
    anonymizedText = anonymizedText.replace(this.PHONE_REGEX, (match) => {
      const token = `[TEL_${tokenIndex++}]`;
      mapping[token] = match;
      return token;
    });

    // 2. Anonymiser les adresses email
    anonymizedText = anonymizedText.replace(this.EMAIL_REGEX, (match) => {
      const token = `[EMAIL_${tokenIndex++}]`;
      mapping[token] = match;
      return token;
    });

    // 3. Anonymiser les montants financiers
    anonymizedText = anonymizedText.replace(this.MONEY_REGEX, (match) => {
      const token = `[MONTANT_${tokenIndex++}]`;
      mapping[token] = match;
      return token;
    });

    // 4. Anonymiser les noms propres locaux avec préfixes courants (Papa, Maman, Mr, Mme)
    const namePatterns = /\b(Papa|Maman|Mr|M\.|Monsieur|Mme|Madame)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g;
    anonymizedText = anonymizedText.replace(namePatterns, (match, title, name) => {
      const token = `[NOM_${tokenIndex++}]`;
      mapping[token] = `${title} ${name}`;
      return token;
    });

    return { anonymizedText, mapping };
  }

  /**
   * Restaure les PII réelles dans le texte en remplaçant les tokens par leurs valeurs d'origine.
   */
  public static deanonymize(anonymizedText: string, mapping: Record<string, string>): string {
    if (!anonymizedText) return "";
    let text = anonymizedText;
    
    for (const [token, originalValue] of Object.entries(mapping)) {
      // Échapper les crochets pour la regex
      const escapedToken = token.replace(/[\[\]]/g, "\\$&");
      text = text.replace(new RegExp(escapedToken, "g"), originalValue);
    }
    
    return text;
  }
}
