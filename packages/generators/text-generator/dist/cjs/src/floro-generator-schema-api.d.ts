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
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg3: string, arg4: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>'], arg3: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>', arg0: string, arg1: string, arg2: string, arg3: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
export declare function makeQueryRef(query: '$(text).localeSettings.locales.localeCode<?>', arg0: string): QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>.phrases.id<?>', arg0: string, arg1: string): QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
export declare function makeQueryRef(query: '$(text).terms.id<?>.localizedTerms.id<?>', arg0: string, arg1: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): QueryTypes['$(text).terms.id<?>.localizedTerms.id<?>'];
export declare function makeQueryRef(query: '$(text).phraseGroups.id<?>', arg0: string): QueryTypes['$(text).phraseGroups.id<?>'];
export declare function makeQueryRef(query: '$(text).terms.id<?>', arg0: string): QueryTypes['$(text).terms.id<?>'];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>'], string, QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>'], string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']): [string, string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']): [string, string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): [string, string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).localeSettings.locales.localeCode<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>.phrases.id<?>']): [string, string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).terms.id<?>.localizedTerms.id<?>']): [string, QueryTypes['$(text).localeSettings.locales.localeCode<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(text).phraseGroups.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(text).terms.id<?>']): [string];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].resultant'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>.sourceAtRevision'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.description']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.description'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>.localizedTerms.id<?>']): SchemaTypes['$(text).terms.id<?>.localizedTerms.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings.locales.localeCode<?>']): SchemaTypes['$(text).localeSettings.locales.localeCode<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>.phrases']): SchemaTypes['$(text).phraseGroups.id<?>.phrases'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>.localizedTerms']): SchemaTypes['$(text).terms.id<?>.localizedTerms'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings.locales']): SchemaTypes['$(text).localeSettings.locales'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups.id<?>']): SchemaTypes['$(text).phraseGroups.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms.id<?>']): SchemaTypes['$(text).terms.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).localeSettings']): SchemaTypes['$(text).localeSettings'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).phraseGroups']): SchemaTypes['$(text).phraseGroups'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(text).terms']): SchemaTypes['$(text).terms'];
