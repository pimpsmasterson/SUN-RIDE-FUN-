class ContentModerationService {
  constructor() {
    // Comprehensive profanity list in multiple languages
    this.profanityWords = [
      // English profanity
      'fuck', 'shit', 'bitch', 'damn', 'hell', 'ass', 'bastard', 'crap', 'piss',
      'slut', 'whore', 'faggot', 'nigger', 'retard', 'gay', 'lesbian', 'homo',
      'cock', 'dick', 'pussy', 'tits', 'boobs', 'sex', 'porn', 'nude', 'naked',
      
      // Hungarian profanity (common ones)
      'kurva', 'szar', 'fasz', 'pina', 'buzi', 'geci', 'picsa', 'csicska',
      'bazmeg', 'kocogj', 'rohadt', 'kibaszott', 'szörnyű', 'idióta',
      
      // German profanity
      'scheiße', 'ficken', 'arsch', 'fotze', 'hure', 'schwul', 'scheiss',
      
      // French profanity
      'merde', 'putain', 'salope', 'connard', 'enculé', 'baise'
    ];

    // Spam patterns
    this.spamPatterns = [
      /(.)\1{4,}/g, // Repeated characters (aaaaa)
      /(.{2,})\1{3,}/g, // Repeated patterns (hahaha)
      /(https?:\/\/[^\s]+)/gi, // URLs
      /(\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b)/g, // Credit card numbers
      /(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g, // Phone numbers in messages
      /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g // Email addresses
    ];

    // Inappropriate content patterns
    this.inappropriatePatterns = [
      /\b(buy|sell|selling|purchase|money|cash|€|$|£|₹|¥)\b/gi,
      /\b(drug|drugs|weed|cocaine|heroin|pills|medication)\b/gi,
      /\b(weapon|gun|knife|bomb|explosive)\b/gi,
      /\b(scam|fraud|fake|stolen|illegal)\b/gi,
      /\b(meet\s+(me|us)\s+(privately|alone|secret))\b/gi,
      /\b(send\s+(photos|pics|pictures|nudes))\b/gi
    ];

    // Festival-related allowed keywords (won't be flagged)
    this.allowedFestivalTerms = [
      'festival', 'music', 'sun', 'csobánkapuszta', 'hungary', 'ride', 'carpool',
      'share', 'travel', 'concert', 'stage', 'artist', 'band', 'camping',
      'food', 'drink', 'meet', 'friend', 'party', 'fun', 'dance'
    ];
  }

  // Main moderation function
  moderateMessage(message, context = {}) {
    const result = {
      isApproved: true,
      filteredMessage: message,
      flags: [],
      severity: 'low', // low, medium, high, critical
      confidence: 0
    };

    // Clean and normalize message
    const cleanMessage = this.normalizeText(message);
    
    // Check for profanity
    const profanityResult = this.checkProfanity(cleanMessage);
    if (profanityResult.found) {
      result.flags.push('profanity');
      result.severity = this.updateSeverity(result.severity, 'high');
      result.filteredMessage = profanityResult.filteredMessage;
      result.confidence = Math.max(result.confidence, 0.9);
    }

    // Check for spam
    const spamResult = this.checkSpam(cleanMessage, context);
    if (spamResult.isSpam) {
      result.flags.push('spam');
      result.severity = this.updateSeverity(result.severity, spamResult.severity);
      result.confidence = Math.max(result.confidence, spamResult.confidence);
    }

    // Check for inappropriate content
    const inappropriateResult = this.checkInappropriate(cleanMessage);
    if (inappropriateResult.found) {
      result.flags.push('inappropriate');
      result.severity = this.updateSeverity(result.severity, 'medium');
      result.confidence = Math.max(result.confidence, 0.7);
    }

    // Check message length and content quality
    const qualityResult = this.checkMessageQuality(cleanMessage);
    if (!qualityResult.isGood) {
      result.flags.push(...qualityResult.issues);
      result.severity = this.updateSeverity(result.severity, 'low');
    }

    // Final decision
    if (result.severity === 'critical' || 
        (result.severity === 'high' && result.confidence > 0.8) ||
        result.flags.includes('profanity')) {
      result.isApproved = false;
    }

    return result;
  }

  // Normalize text for analysis
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Check for profanity
  checkProfanity(message) {
    let found = false;
    let filteredMessage = message;

    for (const word of this.profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(message)) {
        found = true;
        // Replace with asterisks
        filteredMessage = filteredMessage.replace(regex, '*'.repeat(word.length));
      }
    }

    // Check for character substitution (e.g., f*ck, sh!t)
    const substitutionPatterns = [
      { pattern: /f[\*\@\#\$]ck/gi, replacement: '****' },
      { pattern: /sh[\*\@\#\$]t/gi, replacement: '****' },
      { pattern: /b[\*\@\#\$]tch/gi, replacement: '*****' },
      { pattern: /d[\*\@\#\$]mn/gi, replacement: '****' }
    ];

    for (const { pattern, replacement } of substitutionPatterns) {
      if (pattern.test(message)) {
        found = true;
        filteredMessage = filteredMessage.replace(pattern, replacement);
      }
    }

    return { found, filteredMessage };
  }

  // Check for spam patterns
  checkSpam(message, context = {}) {
    let spamScore = 0;
    let reasons = [];

    // Check message length
    if (message.length > 500) {
      spamScore += 2;
      reasons.push('too_long');
    }

    // Check for repeated characters
    if (this.spamPatterns[0].test(message)) {
      spamScore += 3;
      reasons.push('repeated_chars');
    }

    // Check for URLs
    if (this.spamPatterns[2].test(message)) {
      spamScore += 4;
      reasons.push('contains_url');
    }

    // Check for personal info
    if (this.spamPatterns[4].test(message) || this.spamPatterns[5].test(message)) {
      spamScore += 2;
      reasons.push('personal_info');
    }

    // Check message frequency (if context provided)
    if (context.recentMessageCount && context.recentMessageCount > 5) {
      spamScore += 3;
      reasons.push('high_frequency');
    }

    // Check for all caps
    if (message.length > 10 && message === message.toUpperCase()) {
      spamScore += 2;
      reasons.push('all_caps');
    }

    let severity = 'low';
    let confidence = 0.3;

    if (spamScore >= 6) {
      severity = 'high';
      confidence = 0.9;
    } else if (spamScore >= 4) {
      severity = 'medium';
      confidence = 0.7;
    }

    return {
      isSpam: spamScore >= 4,
      severity,
      confidence,
      reasons,
      score: spamScore
    };
  }

  // Check for inappropriate content
  checkInappropriate(message) {
    let found = false;
    let matchedPatterns = [];

    for (const pattern of this.inappropriatePatterns) {
      if (pattern.test(message)) {
        // Check if it's festival-related context
        const isFestivalContext = this.allowedFestivalTerms.some(term => 
          message.includes(term)
        );
        
        if (!isFestivalContext) {
          found = true;
          matchedPatterns.push(pattern.source);
        }
      }
    }

    return { found, patterns: matchedPatterns };
  }

  // Check message quality
  checkMessageQuality(message) {
    const issues = [];

    // Too short
    if (message.length < 2) {
      issues.push('too_short');
    }

    // Only numbers or special characters
    if (!/[a-zA-Z]/.test(message)) {
      issues.push('no_letters');
    }

    // Excessive punctuation
    if ((message.match(/[!?.,;:]/g) || []).length > message.length * 0.3) {
      issues.push('excessive_punctuation');
    }

    return {
      isGood: issues.length === 0,
      issues
    };
  }

  // Update severity level
  updateSeverity(current, newLevel) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentLevel = levels[current] || 1;
    const newLevelNum = levels[newLevel] || 1;
    
    if (newLevelNum > currentLevel) {
      return newLevel;
    }
    return current;
  }

  // Generate user-friendly error messages
  generateModerationMessage(flags, severity) {
    if (flags.includes('profanity')) {
      return 'Your message contains inappropriate language. Please keep the conversation respectful and festival-friendly! 🌞';
    }
    
    if (flags.includes('spam')) {
      if (severity === 'high') {
        return 'Your message appears to be spam. Please share genuine, helpful information about the ride. 🚗';
      }
      return 'Please avoid posting URLs, repeated text, or personal information in chat. Keep it simple and friendly! 😊';
    }
    
    if (flags.includes('inappropriate')) {
      return 'Your message contains content that\'s not appropriate for our carpooling platform. Let\'s keep the focus on getting to the festival safely! 🎵';
    }
    
    if (flags.includes('too_short') || flags.includes('no_letters')) {
      return 'Please write a more complete message to help with communication. 💬';
    }
    
    return 'Your message couldn\'t be posted. Please keep it friendly and festival-related! 🌻';
  }

  // Log moderation events for admin review
  logModerationEvent(userId, message, result, rideId) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      rideId,
      originalMessage: message,
      flags: result.flags,
      severity: result.severity,
      confidence: result.confidence,
      approved: result.isApproved
    };

    // In a production environment, this would go to a logging service
    console.log('Content Moderation Event:', logEntry);
    
    return logEntry;
  }
}

module.exports = new ContentModerationService(); 