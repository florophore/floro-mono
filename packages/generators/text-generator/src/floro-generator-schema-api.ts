export type FileRef = `${string}.${string}`;

export type SchemaTypes = {
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]']: {
    ['booleanComparatorValue']?: boolean;
    ['conjunction']: string;
    ['floatComparatorValue']?: number;
    ['intComparatorValue']?: number;
    ['operator']: string;
    ['stringComparatorValue']?: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions']: Array<{
    ['booleanComparatorValue']?: boolean;
    ['conjunction']: string;
    ['floatComparatorValue']?: number;
    ['intComparatorValue']?: number;
    ['operator']: string;
    ['stringComparatorValue']?: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]']: {
    ['booleanComparatorValue']?: boolean;
    ['floatComparatorValue']?: number;
    ['intComparatorValue']?: number;
    ['operator']: string;
    ['resultant']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
    };
    ['stringComparatorValue']?: string;
    ['subconditions']: Array<{
      ['booleanComparatorValue']?: boolean;
      ['conjunction']: string;
      ['floatComparatorValue']?: number;
      ['intComparatorValue']?: number;
      ['operator']: string;
      ['stringComparatorValue']?: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']: {
    ['booleanMockValue']?: boolean;
    ['floatMockValue']?: number;
    ['intMockValue']?: number;
    ['stringMockValue']?: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals']: Array<{
    ['booleanComparatorValue']?: boolean;
    ['floatComparatorValue']?: number;
    ['intComparatorValue']?: number;
    ['operator']: string;
    ['resultant']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
    };
    ['stringComparatorValue']?: string;
    ['subconditions']: Array<{
      ['booleanComparatorValue']?: boolean;
      ['conjunction']: string;
      ['floatComparatorValue']?: number;
      ['intComparatorValue']?: number;
      ['operator']: string;
      ['stringComparatorValue']?: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue']: {
    ['enabledTerms']: Array<string>;
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue']: {
    ['enabledTerms']: Array<string>;
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue']: {
    ['enabledTerms']: Array<string>;
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue']: {
    ['enabledTerms']: Array<string>;
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues']: Array<{
    ['booleanMockValue']?: boolean;
    ['floatMockValue']?: number;
    ['intMockValue']?: number;
    ['stringMockValue']?: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']: {
    ['conditionals']: Array<{
      ['booleanComparatorValue']?: boolean;
      ['floatComparatorValue']?: number;
      ['intComparatorValue']?: number;
      ['operator']: string;
      ['resultant']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
      };
      ['stringComparatorValue']?: string;
      ['subconditions']: Array<{
        ['booleanComparatorValue']?: boolean;
        ['conjunction']: string;
        ['floatComparatorValue']?: number;
        ['intComparatorValue']?: number;
        ['operator']: string;
        ['stringComparatorValue']?: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
    }>;
    ['defaultValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']: {
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['linkDisplayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['linkHrefValue']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']: {
    ['displayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']: {
    ['displayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']: {
    ['description']: string;
    ['mockValues']: Array<{
      ['booleanMockValue']?: boolean;
      ['floatMockValue']?: number;
      ['intMockValue']?: number;
      ['stringMockValue']?: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules']: Array<{
    ['conditionals']: Array<{
      ['booleanComparatorValue']?: boolean;
      ['floatComparatorValue']?: number;
      ['intComparatorValue']?: number;
      ['operator']: string;
      ['resultant']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
      };
      ['stringComparatorValue']?: string;
      ['subconditions']: Array<{
        ['booleanComparatorValue']?: boolean;
        ['conjunction']: string;
        ['floatComparatorValue']?: number;
        ['intComparatorValue']?: number;
        ['operator']: string;
        ['stringComparatorValue']?: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
    }>;
    ['defaultValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations']: Array<{
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['linkDisplayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['linkHrefValue']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules']: Array<{
    ['displayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision']: {
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules']: Array<{
    ['displayValue']: {
      ['enabledTerms']: Array<string>;
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    };
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests']: Array<{
    ['description']: string;
    ['mockValues']: Array<{
      ['booleanMockValue']?: boolean;
      ['floatMockValue']?: number;
      ['intMockValue']?: number;
      ['stringMockValue']?: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']: {
    ['localeRules']: Array<{
      ['conditionals']: Array<{
        ['booleanComparatorValue']?: boolean;
        ['floatComparatorValue']?: number;
        ['intComparatorValue']?: number;
        ['operator']: string;
        ['resultant']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
        };
        ['stringComparatorValue']?: string;
        ['subconditions']: Array<{
          ['booleanComparatorValue']?: boolean;
          ['conjunction']: string;
          ['floatComparatorValue']?: number;
          ['intComparatorValue']?: number;
          ['operator']: string;
          ['stringComparatorValue']?: string;
          ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
        }>;
      }>;
      ['defaultValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']: {
    ['linkName']: string;
    ['translations']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['linkDisplayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['linkHrefValue']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
    }>;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']: {
    ['localeRules']: Array<{
      ['displayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']: {
    ['enabledTerms']: Array<string>;
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']: {
    ['localeRules']: Array<{
      ['displayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
    ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']: {
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localeTests']: Array<{
      ['description']: string;
      ['mockValues']: Array<{
        ['booleanMockValue']?: boolean;
        ['floatMockValue']?: number;
        ['intMockValue']?: number;
        ['stringMockValue']?: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
    }>;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']: {
    ['id']: string;
    ['name']: string;
    ['varType']: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables']: Array<{
    ['id']: string;
    ['name']: string;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.description']: {
    ['value']?: string;
  };
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants']: Array<{
    ['localeRules']: Array<{
      ['conditionals']: Array<{
        ['booleanComparatorValue']?: boolean;
        ['floatComparatorValue']?: number;
        ['intComparatorValue']?: number;
        ['operator']: string;
        ['resultant']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
        };
        ['stringComparatorValue']?: string;
        ['subconditions']: Array<{
          ['booleanComparatorValue']?: boolean;
          ['conjunction']: string;
          ['floatComparatorValue']?: number;
          ['intComparatorValue']?: number;
          ['operator']: string;
          ['stringComparatorValue']?: string;
          ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
        }>;
      }>;
      ['defaultValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
    ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables']: Array<{
    ['linkName']: string;
    ['translations']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['linkDisplayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['linkHrefValue']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
    }>;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections']: Array<{
    ['localeRules']: Array<{
      ['displayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations']: Array<{
    ['enabledTerms']: Array<string>;
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['json']?: string;
    ['plainText']?: string;
    ['richTextHtml']?: string;
    ['sourceAtRevision']: {
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    };
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses']: Array<{
    ['id']: string;
    ['name']: string;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents']: Array<{
    ['localeRules']: Array<{
      ['displayValue']: {
        ['enabledTerms']: Array<string>;
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      };
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    }>;
    ['name']: string;
    ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases']: Array<{
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localeTests']: Array<{
      ['description']: string;
      ['mockValues']: Array<{
        ['booleanMockValue']?: boolean;
        ['floatMockValue']?: number;
        ['intMockValue']?: number;
        ['stringMockValue']?: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
    }>;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.variables']: Array<{
    ['id']: string;
    ['name']: string;
    ['varType']: string;
  }>;
  ['$(text).phraseGroups.id<?>.phrases.id<?>']: {
    ['contentVariables']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
    ['contentVariablesEnabled']: boolean;
    ['description']: {
      ['value']?: string;
    };
    ['id']: string;
    ['interpolationVariants']: Array<{
      ['localeRules']: Array<{
        ['conditionals']: Array<{
          ['booleanComparatorValue']?: boolean;
          ['floatComparatorValue']?: number;
          ['intComparatorValue']?: number;
          ['operator']: string;
          ['resultant']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
          };
          ['stringComparatorValue']?: string;
          ['subconditions']: Array<{
            ['booleanComparatorValue']?: boolean;
            ['conjunction']: string;
            ['floatComparatorValue']?: number;
            ['intComparatorValue']?: number;
            ['operator']: string;
            ['stringComparatorValue']?: string;
            ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
          }>;
        }>;
        ['defaultValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
    ['interpolationsEnabled']: boolean;
    ['linkVariables']: Array<{
      ['linkName']: string;
      ['translations']: Array<{
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['linkDisplayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['linkHrefValue']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
      }>;
    }>;
    ['linkVariablesEnabled']: boolean;
    ['phraseKey']: string;
    ['phraseSections']: Array<{
      ['localeRules']: Array<{
        ['displayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
    }>;
    ['phraseTranslations']: Array<{
      ['enabledTerms']: Array<string>;
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    }>;
    ['phraseVariablesEnabled']: boolean;
    ['styleClasses']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
    ['styledContentEnabled']: boolean;
    ['styledContents']: Array<{
      ['localeRules']: Array<{
        ['displayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
      ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
    }>;
    ['tags']: Array<string>;
    ['tagsEnabled']: boolean;
    ['testCases']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['localeTests']: Array<{
        ['description']: string;
        ['mockValues']: Array<{
          ['booleanMockValue']?: boolean;
          ['floatMockValue']?: number;
          ['intMockValue']?: number;
          ['stringMockValue']?: string;
          ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
        }>;
      }>;
    }>;
    ['usePhraseSections']: boolean;
    ['variables']: Array<{
      ['id']: string;
      ['name']: string;
      ['varType']: string;
    }>;
  };
  ['$(text).terms.id<?>.localizedTerms.id<?>']: {
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localNotes']?: string;
    ['termValue']?: string;
  };
  ['$(text).localeSettings.locales.localeCode<?>']: {
    ['defaultFallbackLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['defaultTranslateFromLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localeCode']: string;
    ['name']: string;
  };
  ['$(text).phraseGroups.id<?>.phrases']: Array<{
    ['contentVariables']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
    ['contentVariablesEnabled']: boolean;
    ['description']: {
      ['value']?: string;
    };
    ['id']: string;
    ['interpolationVariants']: Array<{
      ['localeRules']: Array<{
        ['conditionals']: Array<{
          ['booleanComparatorValue']?: boolean;
          ['floatComparatorValue']?: number;
          ['intComparatorValue']?: number;
          ['operator']: string;
          ['resultant']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
          };
          ['stringComparatorValue']?: string;
          ['subconditions']: Array<{
            ['booleanComparatorValue']?: boolean;
            ['conjunction']: string;
            ['floatComparatorValue']?: number;
            ['intComparatorValue']?: number;
            ['operator']: string;
            ['stringComparatorValue']?: string;
            ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
          }>;
        }>;
        ['defaultValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
      ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
    }>;
    ['interpolationsEnabled']: boolean;
    ['linkVariables']: Array<{
      ['linkName']: string;
      ['translations']: Array<{
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['linkDisplayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['linkHrefValue']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
      }>;
    }>;
    ['linkVariablesEnabled']: boolean;
    ['phraseKey']: string;
    ['phraseSections']: Array<{
      ['localeRules']: Array<{
        ['displayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
    }>;
    ['phraseTranslations']: Array<{
      ['enabledTerms']: Array<string>;
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['json']?: string;
      ['plainText']?: string;
      ['richTextHtml']?: string;
      ['sourceAtRevision']: {
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      };
    }>;
    ['phraseVariablesEnabled']: boolean;
    ['styleClasses']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
    ['styledContentEnabled']: boolean;
    ['styledContents']: Array<{
      ['localeRules']: Array<{
        ['displayValue']: {
          ['enabledTerms']: Array<string>;
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        };
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      }>;
      ['name']: string;
      ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
    }>;
    ['tags']: Array<string>;
    ['tagsEnabled']: boolean;
    ['testCases']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['localeTests']: Array<{
        ['description']: string;
        ['mockValues']: Array<{
          ['booleanMockValue']?: boolean;
          ['floatMockValue']?: number;
          ['intMockValue']?: number;
          ['stringMockValue']?: string;
          ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
        }>;
      }>;
    }>;
    ['usePhraseSections']: boolean;
    ['variables']: Array<{
      ['id']: string;
      ['name']: string;
      ['varType']: string;
    }>;
  }>;
  ['$(text).terms.id<?>.localizedTerms']: Array<{
    ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localNotes']?: string;
    ['termValue']?: string;
  }>;
  ['$(text).localeSettings.locales']: Array<{
    ['defaultFallbackLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['defaultTranslateFromLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['localeCode']: string;
    ['name']: string;
  }>;
  ['$(text).phraseGroups.id<?>']: {
    ['id']: string;
    ['name']: string;
    ['phrases']: Array<{
      ['contentVariables']: Array<{
        ['id']: string;
        ['name']: string;
      }>;
      ['contentVariablesEnabled']: boolean;
      ['description']: {
        ['value']?: string;
      };
      ['id']: string;
      ['interpolationVariants']: Array<{
        ['localeRules']: Array<{
          ['conditionals']: Array<{
            ['booleanComparatorValue']?: boolean;
            ['floatComparatorValue']?: number;
            ['intComparatorValue']?: number;
            ['operator']: string;
            ['resultant']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
            };
            ['stringComparatorValue']?: string;
            ['subconditions']: Array<{
              ['booleanComparatorValue']?: boolean;
              ['conjunction']: string;
              ['floatComparatorValue']?: number;
              ['intComparatorValue']?: number;
              ['operator']: string;
              ['stringComparatorValue']?: string;
              ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
            }>;
          }>;
          ['defaultValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
      ['interpolationsEnabled']: boolean;
      ['linkVariables']: Array<{
        ['linkName']: string;
        ['translations']: Array<{
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          ['linkDisplayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['linkHrefValue']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
        }>;
      }>;
      ['linkVariablesEnabled']: boolean;
      ['phraseKey']: string;
      ['phraseSections']: Array<{
        ['localeRules']: Array<{
          ['displayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
      }>;
      ['phraseTranslations']: Array<{
        ['enabledTerms']: Array<string>;
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      }>;
      ['phraseVariablesEnabled']: boolean;
      ['styleClasses']: Array<{
        ['id']: string;
        ['name']: string;
      }>;
      ['styledContentEnabled']: boolean;
      ['styledContents']: Array<{
        ['localeRules']: Array<{
          ['displayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
        ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
      }>;
      ['tags']: Array<string>;
      ['tagsEnabled']: boolean;
      ['testCases']: Array<{
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['localeTests']: Array<{
          ['description']: string;
          ['mockValues']: Array<{
            ['booleanMockValue']?: boolean;
            ['floatMockValue']?: number;
            ['intMockValue']?: number;
            ['stringMockValue']?: string;
            ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
          }>;
        }>;
      }>;
      ['usePhraseSections']: boolean;
      ['variables']: Array<{
        ['id']: string;
        ['name']: string;
        ['varType']: string;
      }>;
    }>;
  };
  ['$(text).terms.id<?>']: {
    ['id']: string;
    ['localizedTerms']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['localNotes']?: string;
      ['termValue']?: string;
    }>;
    ['name']: string;
  };
  ['$(text).localeSettings']: {
    ['defaultLocaleRef']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    ['locales']: Array<{
      ['defaultFallbackLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['defaultTranslateFromLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['localeCode']: string;
      ['name']: string;
    }>;
  };
  ['$(text).phraseGroups']: Array<{
    ['id']: string;
    ['name']: string;
    ['phrases']: Array<{
      ['contentVariables']: Array<{
        ['id']: string;
        ['name']: string;
      }>;
      ['contentVariablesEnabled']: boolean;
      ['description']: {
        ['value']?: string;
      };
      ['id']: string;
      ['interpolationVariants']: Array<{
        ['localeRules']: Array<{
          ['conditionals']: Array<{
            ['booleanComparatorValue']?: boolean;
            ['floatComparatorValue']?: number;
            ['intComparatorValue']?: number;
            ['operator']: string;
            ['resultant']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
            };
            ['stringComparatorValue']?: string;
            ['subconditions']: Array<{
              ['booleanComparatorValue']?: boolean;
              ['conjunction']: string;
              ['floatComparatorValue']?: number;
              ['intComparatorValue']?: number;
              ['operator']: string;
              ['stringComparatorValue']?: string;
              ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
            }>;
          }>;
          ['defaultValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
        ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
      }>;
      ['interpolationsEnabled']: boolean;
      ['linkVariables']: Array<{
        ['linkName']: string;
        ['translations']: Array<{
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          ['linkDisplayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['linkHrefValue']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
        }>;
      }>;
      ['linkVariablesEnabled']: boolean;
      ['phraseKey']: string;
      ['phraseSections']: Array<{
        ['localeRules']: Array<{
          ['displayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
      }>;
      ['phraseTranslations']: Array<{
        ['enabledTerms']: Array<string>;
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['json']?: string;
        ['plainText']?: string;
        ['richTextHtml']?: string;
        ['sourceAtRevision']: {
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        };
      }>;
      ['phraseVariablesEnabled']: boolean;
      ['styleClasses']: Array<{
        ['id']: string;
        ['name']: string;
      }>;
      ['styledContentEnabled']: boolean;
      ['styledContents']: Array<{
        ['localeRules']: Array<{
          ['displayValue']: {
            ['enabledTerms']: Array<string>;
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceAtRevision']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            };
          };
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        }>;
        ['name']: string;
        ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
      }>;
      ['tags']: Array<string>;
      ['tagsEnabled']: boolean;
      ['testCases']: Array<{
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['localeTests']: Array<{
          ['description']: string;
          ['mockValues']: Array<{
            ['booleanMockValue']?: boolean;
            ['floatMockValue']?: number;
            ['intMockValue']?: number;
            ['stringMockValue']?: string;
            ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
          }>;
        }>;
      }>;
      ['usePhraseSections']: boolean;
      ['variables']: Array<{
        ['id']: string;
        ['name']: string;
        ['varType']: string;
      }>;
    }>;
  }>;
  ['$(text).terms']: Array<{
    ['id']: string;
    ['localizedTerms']: Array<{
      ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['localNotes']?: string;
      ['termValue']?: string;
    }>;
    ['name']: string;
  }>;
};


export type PointerTypes = {
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.conditionals.[${number}].subconditions.[${number}]`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.conditionals.[${number}].resultant`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.conditionals.[${number}].subconditions`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.conditionals.[${number}]`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.defaultValue.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.linkDisplayValue.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.linkHrefValue.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.displayValue.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.displayValue.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${string}>.mockValues.variableRef<${QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.conditionals`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.defaultValue`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.linkDisplayValue`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.linkHrefValue`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.displayValue`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.displayValue`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${string}>.mockValues`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>.localeRules`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseTranslations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.sourceAtRevision`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>.localeRules`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.contentVariables.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseTranslations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styleClasses.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.variables.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.contentVariables`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.description']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.description`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseTranslations`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styleClasses`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.variables']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.variables`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>`;
  ['$(text).terms.id<?>.localizedTerms.id<?>']: `$(text).terms.id<${string}>.localizedTerms.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).localeSettings.locales.localeCode<?>']: `$(text).localeSettings.locales.localeCode<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases']: `$(text).phraseGroups.id<${string}>.phrases`;
  ['$(text).terms.id<?>.localizedTerms']: `$(text).terms.id<${string}>.localizedTerms`;
  ['$(text).localeSettings.locales']: `$(text).localeSettings.locales`;
  ['$(text).phraseGroups.id<?>']: `$(text).phraseGroups.id<${string}>`;
  ['$(text).terms.id<?>']: `$(text).terms.id<${string}>`;
  ['$(text).localeSettings']: `$(text).localeSettings`;
  ['$(text).phraseGroups']: `$(text).phraseGroups`;
  ['$(text).terms']: `$(text).terms`;
};


export type SchemaRoot = {
  ['text']: {
    ['localeSettings']: {
      ['defaultLocaleRef']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
      ['locales']: Array<{
        ['defaultFallbackLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['defaultTranslateFromLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['localeCode']: string;
        ['name']: string;
      }>;
    };
    ['phraseGroups']: Array<{
      ['id']: string;
      ['name']: string;
      ['phrases']: Array<{
        ['contentVariables']: Array<{
          ['id']: string;
          ['name']: string;
        }>;
        ['contentVariablesEnabled']: boolean;
        ['description']: {
          ['value']?: string;
        };
        ['id']: string;
        ['interpolationVariants']: Array<{
          ['localeRules']: Array<{
            ['conditionals']: Array<{
              ['booleanComparatorValue']?: boolean;
              ['floatComparatorValue']?: number;
              ['intComparatorValue']?: number;
              ['operator']: string;
              ['resultant']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
              };
              ['stringComparatorValue']?: string;
              ['subconditions']: Array<{
                ['booleanComparatorValue']?: boolean;
                ['conjunction']: string;
                ['floatComparatorValue']?: number;
                ['intComparatorValue']?: number;
                ['operator']: string;
                ['stringComparatorValue']?: string;
                ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
              }>;
            }>;
            ['defaultValue']: {
              ['enabledTerms']: Array<string>;
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceAtRevision']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
                ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
              };
            };
            ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          }>;
          ['name']: string;
          ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
        }>;
        ['interpolationsEnabled']: boolean;
        ['linkVariables']: Array<{
          ['linkName']: string;
          ['translations']: Array<{
            ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
            ['linkDisplayValue']: {
              ['enabledTerms']: Array<string>;
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceAtRevision']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
                ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
              };
            };
            ['linkHrefValue']: {
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceAtRevision']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
                ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
              };
            };
          }>;
        }>;
        ['linkVariablesEnabled']: boolean;
        ['phraseKey']: string;
        ['phraseSections']: Array<{
          ['localeRules']: Array<{
            ['displayValue']: {
              ['enabledTerms']: Array<string>;
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceAtRevision']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
                ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
              };
            };
            ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          }>;
          ['name']: string;
        }>;
        ['phraseTranslations']: Array<{
          ['enabledTerms']: Array<string>;
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          ['json']?: string;
          ['plainText']?: string;
          ['richTextHtml']?: string;
          ['sourceAtRevision']: {
            ['json']?: string;
            ['plainText']?: string;
            ['richTextHtml']?: string;
            ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          };
        }>;
        ['phraseVariablesEnabled']: boolean;
        ['styleClasses']: Array<{
          ['id']: string;
          ['name']: string;
        }>;
        ['styledContentEnabled']: boolean;
        ['styledContents']: Array<{
          ['localeRules']: Array<{
            ['displayValue']: {
              ['enabledTerms']: Array<string>;
              ['json']?: string;
              ['plainText']?: string;
              ['richTextHtml']?: string;
              ['sourceAtRevision']: {
                ['json']?: string;
                ['plainText']?: string;
                ['richTextHtml']?: string;
                ['sourceLocaleRef']?: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
              };
            };
            ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          }>;
          ['name']: string;
          ['styleClassRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
        }>;
        ['tags']: Array<string>;
        ['tagsEnabled']: boolean;
        ['testCases']: Array<{
          ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
          ['localeTests']: Array<{
            ['description']: string;
            ['mockValues']: Array<{
              ['booleanMockValue']?: boolean;
              ['floatMockValue']?: number;
              ['intMockValue']?: number;
              ['stringMockValue']?: string;
              ['variableRef']: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
            }>;
          }>;
        }>;
        ['usePhraseSections']: boolean;
        ['variables']: Array<{
          ['id']: string;
          ['name']: string;
          ['varType']: string;
        }>;
      }>;
    }>;
    ['terms']: Array<{
      ['id']: string;
      ['localizedTerms']: Array<{
        ['id']: QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
        ['localNotes']?: string;
        ['termValue']?: string;
      }>;
      ['name']: string;
    }>;
  };
};



const getCounterArrowBalanance = (str: string): number => {
  let counter = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
  }
  return counter;
};

const extractKeyValueFromRefString = (
  str: string
): { key: string; value: string } => {
  let key = "";
  let i = 0;
  while (str[i] != "<") {
    key += str[i++];
  }
  let value = "";
  let counter = 1;
  i++;
  while (i < str.length) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
    if (counter >= 1) {
      value += str[i];
    }
    i++;
  }
  return {
    key,
    value,
  };
};

const splitPath = (str: string): Array<string> => {
  let out: Array<string> = [];
  let arrowBalance = 0;
  let curr = "";
  for (let i = 0; i <= str.length; ++i) {
    if (i == str.length) {
      out.push(curr);
      continue;
    }
    if (arrowBalance == 0 && str[i] == ".") {
      out.push(curr);
      curr = "";
      continue;
    }
    if (str[i] == "<") {
      arrowBalance++;
    }
    if (str[i] == ">") {
      arrowBalance--;
    }
    curr += str[i];
  }
  return out;
};

const decodeSchemaPathWithArrays = (
  pathString: string
): Array<{key: string, value: string} | string | number> => {
  return splitPath(pathString).map((part) => {
    if (/^\[(\d+)\]$/.test(part)) {
      return parseInt(((/^\[(\d+)\]$/.exec(part) as Array<string>)[1]));
    }
    if (/^(.+)<(.+)>$/.test(part) && getCounterArrowBalanance(part) == 0) {
      const { key, value } = extractKeyValueFromRefString(part);
      return {
        key,
        value,
      };
    }
    return part;
  });
};

const getObjectInStateMap = (
  stateMap: { [pluginName: string]: object },
  path: string
): object | null => {
  let current: null | object = null;
  const [pluginWrapper, ...decodedPath] = decodeSchemaPathWithArrays(path);
  const pluginName = /^\$\((.+)\)$/.exec(pluginWrapper as string)?.[1] ?? null;
  if (pluginName == null) {
    return null;
  }
  current = stateMap[pluginName];
  for (const part of decodedPath) {
    if (!current) {
      return null;
    }
    if (typeof part == "number") {
      current = current[part];
    } else if (typeof part != "string") {
      const { key, value } = part as {key: string, value: string};
      if (Array.isArray(current)) {
        const element = current?.find?.((v) => v?.[key] == value);
        current = element;
      } else {
        return null;
      }
    } else {
      current = current[part];
    }
  }
  return current ?? null;
};
export type QueryTypes = {
  ['$(text).phraseGroups.id<?>']: `$(text).phraseGroups.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.contentVariables.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.interpolationVariants.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.linkVariables.linkName<${string}>.translations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseSections.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.phraseTranslations.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styleClasses.id<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.styledContents.name<${string}>.localeRules.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${string}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.testCases.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${string}>.mockValues.variableRef<${QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']}>`;
  ['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']: `$(text).phraseGroups.id<${string}>.phrases.id<${string}>.variables.id<${string}>`;
  ['$(text).terms.id<?>']: `$(text).terms.id<${string}>`;
  ['$(text).terms.id<?>.localizedTerms.id<?>']: `$(text).terms.id<${string}>.localizedTerms.id<${QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  ['$(text).localeSettings.locales.localeCode<?>']: `$(text).localeSettings.locales.localeCode<${string}>`;
};

export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg3: string, arg4: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg3: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
export function makeQueryRef(query: '$(text).localeSettings.locales.localeCode<?>', arg0: string): QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>', arg0: string, arg1: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
export function makeQueryRef(query: '$(text).terms.id<?>.localizedTerms.id<?>', arg0: string, arg1: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).terms.id<?>.localizedTerms.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>', arg0: string): QueryTypes['$(text).phraseGroups.id<?>'];
export function makeQueryRef(query: '$(text).terms.id<?>', arg0: string): QueryTypes['$(text).terms.id<?>'];
export function makeQueryRef(query: '$(text).phraseGroups.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>'|'$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'|'$(text).terms.id<?>'|'$(text).terms.id<?>.localizedTerms.id<?>'|'$(text).localeSettings.locales.localeCode<?>', arg0: string, arg1?: string|QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg2?: string|QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg3?: QueryTypes['$(text).localeSettings.locales.localeCode<?>']|string, arg4?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): QueryTypes['$(text).phraseGroups.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']|QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']|QueryTypes['$(text).terms.id<?>']|QueryTypes['$(text).terms.id<?>.localizedTerms.id<?>']|QueryTypes['$(text).localeSettings.locales.localeCode<?>']|null {
  if ((arg0 != null && arg0 != undefined) && query == '$(text).phraseGroups.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.contentVariables.id<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.interpolationVariants.name<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.interpolationVariants.name<${arg2 as string}>.localeRules.id<${arg3 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.linkVariables.linkName<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.linkVariables.linkName<${arg2 as string}>.translations.id<${arg3 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.phraseSections.name<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.phraseSections.name<${arg2 as string}>.localeRules.id<${arg3 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.phraseTranslations.id<${arg2 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.styleClasses.id<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.styledContents.name<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.styledContents.name<${arg2 as string}>.localeRules.id<${arg3 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.testCases.id<${arg2 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.testCases.id<${arg2 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${arg3 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && (arg4 != null && arg4 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.testCases.id<${arg2 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>.localeTests.description<${arg3 as string}>.mockValues.variableRef<${arg4 as QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>') {
    return `$(text).phraseGroups.id<${arg0 as string}>.phrases.id<${arg1 as string}>.variables.id<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(text).terms.id<?>') {
    return `$(text).terms.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(text).terms.id<?>.localizedTerms.id<?>') {
    return `$(text).terms.id<${arg0 as string}>.localizedTerms.id<${arg1 as QueryTypes['$(text).localeSettings.locales.localeCode<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(text).localeSettings.locales.localeCode<?>') {
    return `$(text).localeSettings.locales.localeCode<${arg0 as string}>`;
  }
  return null;
};


export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>'], string, QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>'], string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>']): [string, string];
export function extractQueryArgs(query?: QueryTypes['$(text).terms.id<?>.localizedTerms.id<?>']): [string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(text).terms.id<?>']): [string];
export function extractQueryArgs(query?: string): Array<string> {
  if (!query) {
    return [];
  }
  return (
    decodeSchemaPathWithArrays(query)
      ?.filter((v) => typeof v != "string")
      ?.map((v) => (v as { key: string; value: string }).value as string) ?? []
  );
};

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.description']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.description'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>.localizedTerms.id<?>']): SchemaTypes['$(text).terms.id<?>.localizedTerms.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings.locales.localeCode<?>']): SchemaTypes['$(text).localeSettings.locales.localeCode<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases']): SchemaTypes['$(text).phraseGroups.id<?>.phrases'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>.localizedTerms']): SchemaTypes['$(text).terms.id<?>.localizedTerms'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings.locales']): SchemaTypes['$(text).localeSettings.locales'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>']): SchemaTypes['$(text).terms.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings']): SchemaTypes['$(text).localeSettings'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups']): SchemaTypes['$(text).phraseGroups'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms']): SchemaTypes['$(text).terms'];

export function getReferencedObject<T>(root: SchemaRoot, query?: string): T|null {
  if (!query) {
    return null;
  }
  const existingObj = getObjectInStateMap(
    root,
    query
  );
  if (existingObj) {
    return existingObj as T;
  }
  return null;
};

