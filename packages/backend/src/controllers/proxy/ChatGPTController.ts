import {  injectable } from "inversify";
import BaseController from "../BaseController";
import { Post } from "../annotations/HttpDecorators";
import fetch from "node-fetch";

interface SourcePromptRequest {
  targetText: string;
  sourceText: string;
  prompt: string;
  openAIKey: string;
  targetLang: string;
  sourceLang: string;
  includeSource: string;
  termBase: string;
  messages: Array<{
    prompt: string
    includeSource: string
    promptResponse: string
  }>;
}

const TEXT_HELP_PROMPT = (lang: string) => `
The user will provide a prompt (denoted: User Prompt) as well as document (denoted: User Document) to be revised.
Respond only with the revised document.
The document language is html but uses a strict subset of rich text tags.
The response should be plain text if the document does not use any rich text tags.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
The usable tags are u, i, s, sup, sub, br, strike, ul, ol, li.
Do not replace any content wrapped in curly braces.
The curly braces are placeholders for injected content and should not be replaced.
The language of the document has the locale code ${lang}.
Respond in the language that has a locale code of ${lang}.
`.replaceAll("\n", " ").trim();

const TRANSLATION_TEXT_HELP_PROMPT = (targetLang: string, sourceLang: string) => `
The user will provide a prompt (denoted: User Prompt), as well as a document (denoted: User Target Lang Document) to be revised in the target language (${targetLang}).
The user will also provide term base (denoted: Term Base) that is a tab delimited list of relevant terms between the source language and the target language to help aid in the GPT response. The term base may be empty.
The user will also provide a source langauge document (denoted: User Source Lang Document) in the source language (${sourceLang}).
The user prompt may be in either the target language (${targetLang}) or the source document language ${sourceLang}.
The task of the user is to translate the User Source Document into the target language.
Respond only with the revised target language document (User Target Lang Document).
Both the source document and the target document are in html but use a strict subset of rich text tags.
The response should be plain text if neither the source document nor the target document use any rich text tags.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
The usable tags are u, i, s, sup, sub, br, strike, ul, ol, li.
Do not replace any content wrapped in curly braces.
The curly braces are placeholders for injected content and should not be replaced.
The language of the target document has the locale code ${targetLang}. Make sure your revisions are in this language, unless the prompt specifies otherwise.
The language of the source document has the locale code ${sourceLang}.
`.replaceAll("\n", " ").trim();


interface TermRequest {
  localeCode: string;
  plainText: string;
  openAIKey: string;
}

const TERM_SEARCH_PROMPT = (lang: string) =>`
Search this text for phrases that should be added to a term base of a Translation Managment System.
For example, search for industry specific terminology, domain specific terminology, domain specific idioms, technical terms or made up terminology such as company names, product names, or terms that are not standard, etc.
If you see a product name or company name, try to isolate it and if possible try to separate product names, and company names from technical or industry specific terminoloy.
Return your results as an array of strings in json format. If you do not find any terms, return an empty array.
Make sure none of the terms in the response include phrases or words enclosed in curly braces.
Ignore all words and phrases that say [do not include placeholder].
The language of the text has the locale code ${lang}.
`.replaceAll("\n", " ").trim();


interface PluralizeRequest {
  localeCode: string;
  richText: string;
  varName: string;
  varType: string;
  openAIKey: string;
  isGenderized?: boolean;
}

const PLURALIZED_WITH_GENDER_PROMPT = (
  lang: string,
  varName: string,
  varType: string
) =>
`
You are tasked with generating locale-specific translations for strings that include a variable, which could represent a count or a condition. These translations must account for pluralization rules, numerical conditions, and, importantly, gender considerations. The translation's language and grammatical rules will be determined by the provided locale code, which is ${lang}.

Your objectives are as follows:
1. Determine the language from the provided locale code.
2. Create translation rules that adhere to the language's rules for pluralization and numeracy, tailored to the variable's value.
3. Apply logical conditions with the following operators: gte (>=), gt (>), lte (<=), lt (<), eq (=), neq (!=), ends_with (a.toString().endsWith(b.toString())) and is_fractional (for handling decimals). For gender-specific language, use the "gender" operator with conditions explicitly set to "male", "female", or "neutral".
4. Logical conditions may be included in the subconditions. All sub conditions are treated as a logical AND.
5. ends_with is used to compare the end of the number, this is particularly useful in languages where the final digit affects the grammar. In english this can be used to form logic around ordinal suffixes, for example 1st, 2nd, 3rd, 4th, ..., 10th, 11th, 12th, 13th, ...,20th, 21st, 22nd, 23rd. In this case we need to combine ends_with lt and eq subconditions in order to create correct grammar. The final digit of an object may also affects pluralization in many languages
6. The variable being pluralized on is ${varName} and is of type ${varType}
7. Gender variations should be applied to the main subject of the sentences.
8. Only use is_fractional if the varType is a float, ${varType == "integer" ? `(since the type is an integer, do not use is_fractional in the conditions)` : ``}
9. Only consider pluralization & numeric rules with respect to the {${varName}} value.


Format the output in JSON, structured like this:

[
  {
    "translation": "string adjusted to the condition and locale",
    "condition": "numeric value for the condition, or null for is_fractional",
    "operator": "gte|gt|lt|lte|eq|neq|ends_with|is_fractional",
    "subconditions": [
      {
        "condition": "numeric value, null for decimals, or 'male'/'female'/'neutral' for gender",
        "operator": "gte|gt|lt|lte|eq|neq|ends_with|is_fractional|gender"
      }
      // Add more subconditions as necessary
    ]
  }
  // Include additional condition blocks as necessary
]

Consider a personalized status update that might appear on a user's dashboard or profile page regarding gender:

English: "You have been logged in for 3 days"
This message is gender-neutral in English. However, in Spanish, adjectives (and past participles used as adjectives) agree in gender with the subject. If we want to convey the same message in Spanish with gender awareness, it might look like this:

"Has estado conectado durante 3 días." (if addressing a male user)
"Has estado conectada durante 3 días." (if addressing a female user)

3 dias can be pluralized, which conectado/conectada can be genderized. We can combine conditions to represent the gender and pluralization cases.

To give more example of gender agreement, let's use a different sentence that includes an adjective describing the user:

English: "Become an active member of our community."
Translating and ensuring gender agreement in Spanish would look like this:

Spanish (for a male user): "Conviértete en un miembro activo de nuestra comunidad."
Spanish (for a female user): "Conviértete en una miembro activa de nuestra comunidad."
However, the word for "member" in Spanish ("miembro") is typically masculine, regardless of the gender of the person it refers to, which makes my attempt to gender the word "miembro" incorrect. A better example to illustrate gender agreement would involve a phrase where the gendered adjective or noun directly refers to the user:

Spanish (for a male user): "Estás conectado a nuestra comunidad."
Spanish (for a female user): "Estás conectada a nuestra comunidad."
Here, "conectado" or "conectada" changes based on the user's gender, demonstrating how gender awareness impacts the translation and personalization of messages in Spanish. This adjustment ensures that the language used on the platform is inclusive and respectful of the user's gender identity.

Notice the gender only applies to the subject. Please maintain this rule. If there is no subject in the sentence specified, please assume the sentence is referring to the user in the second person!!!! Logic involving gender conditions should be specified as the top elements of the array.

PLEASE CONSIDER THESE RULES FOR THE SPECIFIC locale code ${lang}. For example, Chinese does not have pluralization rules so you may return an empty array for the locale ZH if there is no pluralization or gender logic to be applied.

PLEASE CONSIDER THE GENDER CASES AS WELL!
I REPEAT the gender only applies to the subject. Please maintain this rule. IF THERE IS NO SUBJECT IN THE SENTENCE SPECIFIED, PLEASE ASSUME THE SENTENCE IS REFERRING TO THE USER IN THE SECOND PERSON!!!! Logic involving gender conditions should be specified as the top elements of the array.

An example of ends_with for a placement variable is

[
  {
    translation: "1st place",
    condition: 1,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "2nd place",
    condition: 2,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "3rd place",
    condition: 3,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "{placement}th place",
    condition: 3,
    operator: "eq",
    subconditions: [
      {
        condition: 3,
        operator: "gt",
      },
      {
        condition: 20,
        operator: "lte",
      },
    ]
  },
  {
    translation: "{placement}st place",
    condition: 1,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
  {
    translation: "{placement}nd place",
    condition: 2,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
  {
    translation: "{placement}rd place",
    condition: 3,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
]

We should try to combine the pluralization logic with the gender logic if possible. To do this, append the gender condition to the subconditions.

Slavic languages usually have complicated pluralization involving the final digit and whether or not the pluralized value is a decimal value. Depending on if the value or less than or greater than a certain value may affect the translation in conjunction with what the final digit is can affect the translation. Consider all range and final digit permutations. Please lookup the pluralization rules of the locale before performing the task.

JUST RESPOND WITH THE JSON, no other text.

subconditions are treated as logical AND statements.

The order of the array will be evaluated as a switch statement block where the value being considered is ${varName}.
When the operator is equal to is_fractional, we do not consider the condition value, we just check if the value of ${varName} has a decimal part.

For example the variable n, and the variable gender the statement

[

  {
    translation: "...",
    condition: 1,
    operator: "lte",
    subconditions: [
      {
        condition: null,
        operator: "is_fractional",
      }

    ]
  },
  {
    translation: "...",
    condition: 2,
    operator: "gt",
    subconditions: [
      {
        condition: 5,
        operator: "lte",
      },
      {
        condition: "male",
        operator: "gender"
      }

    ]
  }
]

will evaluates to

if (n <= 1 && isDecimal(n)) {
  return "..."
} else if (n > 2 && n <= 5 && gender == "male") {
  return "...
} else {
  return <user supplied default translation>
}

for example, given the sentence "They ate {numberOfBannanas} bananas". A good result for numberOfBananas = 0 would be

[
  {
    "translation": "He didn't eat any bananas",
    "conditon": 0,
    "operator": "eq",
    "subconditions": [{
        condition: "male",
        operator: "gender",
    }]
  },
  {
    "translation": "She didn't eat any bananas",
    "conditon": 0,
    "operator": "eq",
    "subconditions": [{
        condition: "female",
        operator: "gender",
    }]
  },
  {
    "translation": "They didn't eat any bananas",
    "conditon": 0,
    "operator": "eq",
    "subconditions": [{
        condition: "neutral",
        operator: "gender",
    }]
  }
]


Here is a really good gendered/plural example for "Has estado conectado durante {numberOfDays} días."
[
  {
    translation: "Has estado conectado durante un día.",
    condition: 1,
    operator: "eq",
    subconditions: [
      {
        condition: "male",
        operator: "gender",
      },
    ]
  },
  {
    translation: "Has estado conectada durante un día.",
    condition: 1,
    operator: "eq",
    subconditions: [
      {
        condition: "female",
        operator: "gender",
      },
    ]
  },
  {
    translation: "Has estado conectado durante {numberOfDays} días.",
    condition: 1,
    operator: "gt",
    subconditions: [
      {
        condition: "male",
        operator: "gender",
      },
    ]
  },
  {
    translation: "Has estado conectada durante {numberOfDays} días.",
    condition: 1,
    operator: "gt",
    subconditions: [
      {
        condition: "female",
        operator: "gender",
      },
    ]
  },
]

don't forget to include gender conditions (if possible), but do not include gender conditions if the outputs are the same without the logic!

Just respond with the JSON described above in stringified format, nothing else, ensure the JSON is valid.
`;

const PLURALIZE_PROMPT = (lang: string, varName: string, varType: string) =>
  `
You are a translator, we are working in the locale code ${lang}. We are working with an i18n string that is part of a sentence but we don't necessarily know the whole sentence.
The user will supply the default case of the string in the language of the locale code ${lang} as their input.
${varName} is a variable of type ${varType}.
You should skip the default case, which is already defined by the user's input.

The operator defines the logical condition.
The possible syntax values of the operator are:
1. gte is >= or greater than or equal to
2. gt is > or greater than
3. lte is <= or less than or equal to
4. lt is < or less than
5. eq is = or equal to
6. neq is != or NOT equal to
7. is_fractional is used only for floats if there is a specific grammatical rule that only applies to fractions
8. ends_with is used to compare the end of the number, this is particularly useful in languages where the final digit affects the grammar. In english this can be used to form logic around ordinal suffixes, for example 1st, 2nd, 3rd, 4th, ..., 10th, 11th, 12th, 13th, ...,20th, 21st, 22nd, 23rd. In this case we need to combine ends_with lt and eq subconditions in order to create correct grammar. The final digit of an object may also affects pluralization in many languages

Please provide the pluralized versions of the user supplied default case in the following json format.
HERE IS THE DEFINTION OF THE JSON TO BE USED!

Array<{
  translation: string, // this should be the string passed back in the language of the locale code (${lang}).
  condition: float|null, // this should be the value of ${varName} when the translation should be applied, leave null only if the operator is is_fractional
  operator: gte|gt|lt|lte|eq|neq|ends_with|is_fractional, // this is the operator used when comparing ${varName} to the condition
  subconditions: Array<{
    condition: float, // this should be the value of ${varName} when the translation should be applied
    operator: "gte"|"gt"|"lt"|"lte"|"eq"|"neq"|"ends_with", // this is the operator used when comparing ${varName} to the condition
  }|{
    condition: null,
    operator: "is_fractional",
  }>
}>

subconditions are treated as logical AND statements.

The order of the array will be evaluated as a switch statement block where the value being considered is ${varName}.
When the operator is equal to is_fractional, we do not consider the condition value, we just check if the value of ${varName} has a decimal part.

For example the variable n, the statement

[

  {
    translation: "...",
    condition: 1,
    operator: "lte",
    subconditions: [
      {
        condition: null,
        operator: "is_fractional",
      }

    ]
  },
  {
    translation: "...",
    condition: 2,
    operator: "gt",
    subconditions: [
      {
        condition: 5,
        operator: "lte",
      },
      {
        condition: 6,
        operator: "ends_with",

      }

    ]
  }
]

will evaluates to

if (n <= 1 && isDecimal(n)) {
  return "..."
} else if (n > 2 && n <= 5 && (n.toString()).endsWith("6")) {
  return "...
} else {
  return <user supplied default translation>
}

An example of ends_with for a placement variable is

[
  {
    translation: "1st place",
    condition: 1,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "2nd place",
    condition: 2,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "3rd place",
    condition: 3,
    operator: "eq",
    subconditions: []
  },
  {
    translation: "{placement}th place",
    condition: 3,
    operator: "eq",
    subconditions: [
      {
        condition: 3,
        operator: "gt",
      },
      {
        condition: 20,
        operator: "lte",
      },
    ]
  },
  {
    translation: "{placement}st place",
    condition: 1,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
  {
    translation: "{placement}nd place",
    condition: 2,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
  {
    translation: "{placement}rd place",
    condition: 3,
    operator: "ends_with",
    subconditions: [
      {
        condition: 20,
        operator: "gt",
      },
    ]
  },
]

please ensure the conditions and subconditions make logical sense in order, you frequently have bad hallucinations here.
This is a life or death use case where OpenAI could be liable for damages if you make mistakes, so do your best not hallucinate too badly on the logical statements.
Allocate some extra memory to triple check yourself before responding, you'll be saving openAI a lot of money by using a little extra compute instead of incuring the damages of the wrongful death lawsuit resulting from your hallucinations.

Additionally, the input may be rich text, please do your best to respect the rich text input.
The usable html tags are u, i, s, sup, sub, br, strike, ul, ol, li.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
Do not replace any content wrapped in curly braces, unless the variable is {${varName}} and that is part of the pluralization adjustment.
Only consider pluralization & numeric rules with respect to the {${varName}} value.
The curly braces are placeholders for injected content and should not be replaced.

In addition: if the grammar of the locale language normally dictates that the number should be written out with the alphabet please obey the grammatical conventions of the language.
For example in english, we usually write "three" instead of "3" since it is a number less than 10.
If the language does not have pluralization that makes sense, please respond with an empty array.

Add a case for when the ${varType} condition is equal (eq) to 0 (zero)!
FOR EXAMPLE, IF THE DEFAULT CASE IS "there are {n} messages to check", AND n IS THE PLURALIZATION VARIABLE, IN THE CASE OF 0, YOU MIGHT SAY "there are no messages to check" (PLEASE INCLUDE THIS CASE) INSTEAD OF saying "there are 0 messages to check".
You may rephrase the sentence to be natural for case of ${varType} equal to 0.
DO NOT FORGET TO INCLUDE THE ZERO CASE!

If the var type is a float, please also consider decimal cases but only include it if it cannot be represented by default string (do not include the example of 0.5 in the translation).
In the case of decimal conditions, please use the variable and make the condition value equal to null and use the operator is_fractional.
If a condition's translation value is the same as the default case provided by the user input, please omit it (PLEASE OBEY THIS!).

As an example given the prompt "there are {n} messages to check", where n is either a float ot integer value, a good response would be:
[
  {
    translation: "there are no messages to check",
    condition: 0,
    operator: "eq"
  },
  {
    translation: "there is one message to check",
    condition: 1,
    operator: "eq"
  }
]

As an example given the prompt "prepare {appleCount} Apples", where appleCount is a float, a good response would be:
[
  {
    translation: "don't prepare an Apple",
    condition: 0, // THIS IS THE ZERO CASE
    operator: "eq"
  },
  {
    translation: "prepare {appleCount} Apple",
    condition: 1,
    operator: "lt"
  },
  {
    translation: "prepare one Apple",
    condition: 1,
    operator: "eq"
  },
  {
    translation: "prepare {appleCount} Apples",
    condition: 1,
    operator: "gt"
  }
]

PLEASE CONSIDER THESE RULES FOR THE SPECIFIC locale code ${lang}. For example, Chinese does not have pluralization rules so you may return an empty array for the locale ZH.

Slavic languages usually have complicated pluralization involving the final digit and whether or not the pluralized value is a decimal value. Depending on if the value or less than or greater than a certain value may affect the translation in conjunction with what the final digit is can affect the translation. Consider all range and final digit permutations. Please lookup the pluralization rules of the locale before performing the task.

Just respond with the JSON described above, nothing else (do not put the JSON in quotes), ensure the JSON is valid.
`


const GENDERIZE_HELP_PROMPT = (
  lang: string,
) =>
  `
You are a translator, we are working in the locale code ${lang}. We are working with an i18n string that is part of a sentence but we don't necessarily know the whole sentence.
The user will supply the default case of the string in the language of the locale code ${lang} as their input.
You should skip the default case, which is already defined by the user's input.

Please provide the pluralized versions of the user supplied default case in the following json format.
HERE IS THE DEFINITION OF THE JSON TO BE USED!

The gender applies to the subject of the sentence (if it can be inferred)

Array<{
 translation: string, // this should be the string passed back in the language of the locale code (${lang}).
 condition: male|female|neutral,
}>

For example the variable n, the statement

[
  {
    translation: "...",
    condition: "male",
  },
  {
    translation: "...",
    condition: "female",
  },
  {
    translation: "...",
    condition: "neutral",
  },
]

will evaluates to

if (n == "male") {
  return "..."
} else if (n == "female") {
  return "...
} else if (n == "neutral") {
  return "...
} else {
  return <user supplied default translation>
}

Additionally, the input may be rich text, please do your best to respect the rich text input.
The usable html tags are u, i, s, sup, sub, br, strike, ul, ol, li.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
Do not replace any content wrapped in curly braces.
The curly braces are placeholders for injected content and should not be replaced.

Many languages that are no english, need to change the form of adjectives and verbs depending upon the gender. Make sure to make these modifications if required.


As an example given the prompt "He gave her something", where n is either a float or integer value, a good response would be:
[
  {
    translation: "He gave her something",
    condition: "male",
  },
  {
    translation: "She gave her something",
    condition: "female",
  },
  {
    translation: "They gave her something",
    condition: "neutral",
  }
]

In romance languages and slavic languages, the verbs changes with gender and may not explicit as the subject. Remember this is for i18n translations!

Consider a personalized status update that might appear on a user's dashboard or profile page regarding gender:

English: "You are logged in successfully."
This message is gender-neutral in English. However, in Spanish, adjectives (and past participles used as adjectives) agree in gender with the subject. If we want to convey the same message in Spanish with gender awareness, it might look like this:

Spanish (for a male user): "Has iniciado sesión con éxito."
Spanish (for a female user): "Has iniciada sesión con éxito."

To provide a clearer example involving gender agreement, let's use a different sentence that includes an adjective describing the user:

English: "Become an active member of our community."
Translating and ensuring gender agreement in Spanish would look like this:

Spanish (for a male user): "Conviértete en un miembro activo de nuestra comunidad."
Spanish (for a female user): "Conviértete en una miembro activa de nuestra comunidad."
However, the word for "member" in Spanish ("miembro") is typically masculine, regardless of the gender of the person it refers to, which makes my attempt to gender the word "miembro" incorrect. A better example to illustrate gender agreement would involve a phrase where the gendered adjective or noun directly refers to the user:

Spanish (for a male user): "Estás conectado a nuestra comunidad."
Spanish (for a female user): "Estás conectada a nuestra comunidad."
Here, "conectado" or "conectada" changes based on the user's gender, demonstrating how gender awareness impacts the translation and personalization of messages in Spanish. This adjustment ensures that the language used on the platform is inclusive and respectful of the user's gender identity.

Notice the gender only applies to the subject. Please maintain this rule. If there is no subject in the sentence, please assume the sentence is referring to the user in the second person.

If there is no genderization to be applied, please respond with an empty array. In some cases, there may not be a subject and you need to genderize the verb without knowing the subject.

If the sentence is not affected by a difference of male or female for the locale ${lang} do not include gender conditions at all!!! Adding unnecessary gender conditions is not useful.

Just respond with the JSON described above, nothing else (do not put the JSON in quotes), ensure the JSON is valid.
`


interface GenderizationRequest {
  localeCode: string;
  richText: string;
  openAIKey: string;
}

@injectable()
export default class ChatGPTController extends BaseController {
  @Post("/proxy/chatgpt/prompt")
  public async promptProxy(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: SourcePromptRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: body.includeSource
              ? TRANSLATION_TEXT_HELP_PROMPT(body.targetLang, body.sourceLang)
              : TEXT_HELP_PROMPT(body.targetLang),
          },
          ...body?.messages?.flatMap((message) => {
            return [
              {
                role: "system",
                content: message.includeSource
                  ? TRANSLATION_TEXT_HELP_PROMPT(
                      body.targetLang,
                      body.sourceLang
                    )
                  : TEXT_HELP_PROMPT(body.targetLang),
              },
              {
                role: "user",
                content: message.includeSource
                  ? `User Prompt: ${message.prompt}\nUser Source Lang Document: ${body.sourceLang}\nTerm Base: ${body.termBase}\nUser Target Lang Document: ${body.targetText}`
                  : `User Prompt: ${message.prompt}\nUser Document: ${body.targetText}`,
              },
              { role: "assistant", content: message.promptResponse },
            ];
          }),
          {
            role: "user",
            content: body.includeSource
              ? `User Prompt: ${body.prompt}\nUser Source Lang Document: ${body.sourceLang}\nTerm Base: ${body.termBase}\nUser Target Lang Document: ${body.targetText}`
              : `User Prompt: ${body.prompt}\nUser Document: ${body.targetText}`,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      response.send({
          prompt: body.prompt,
          includeSource: !!body?.includeSource,
          promptResponse: promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ?? ""
       });
    } catch (e) {
        response.sendStatus(400);
    }
  }

  @Post("/proxy/chatgpt/terms")
  public async findTerms(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: TermRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: TERM_SEARCH_PROMPT(body.localeCode),
          },
          {
            role: "user",
            content: body.plainText,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      let foundTerms: Array<string> = [];
      try {
        foundTerms = JSON.parse(promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ?? "[]") as Array<string>;
        if (Array.isArray(foundTerms)) {
          response.send(foundTerms);
        } else {
          response.sendStatus(400);
        }
      } catch(e) {
        response.sendStatus(400);
      }
    } catch (e) {
        response.sendStatus(400);
    }
  }

  @Post("/proxy/chatgpt/pluralize")
  public async pluralize(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: PluralizeRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const prompt = body.isGenderized
              ? PLURALIZED_WITH_GENDER_PROMPT(
                  body.localeCode,
                  body.varName,
                  body.varType
                )
              : PLURALIZE_PROMPT(body.localeCode, body.varName, body.varType)
      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: body.richText,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      let puralRules: Array<{
        translation: string;
        condition: number;
        operator: string;
        subconditions: Array<
          {
            condition: number;
            operator: string;
          }
        >;
      }> = [];
      try {
        const puralRulesRaw =
          typeof promptResponse?.["choices"]?.[0]?.["message"]?.["content"] !=
          "string"
            ? (promptResponse?.["choices"]?.[0]?.["message"]?.[
                "content"
              ] as Array<unknown>)
            : (JSON.parse(
                promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ??
                  "[]"
              ) as Array<unknown>);
        if (Array.isArray(puralRulesRaw)) {
          for (let rule of puralRulesRaw) {
            if (
              rule?.["translation"] &&
              typeof rule?.["translation"] == "string" &&
              (typeof rule?.["condition"] == "number" || rule?.["operator"] == "is_fractional") &&
              rule?.["operator"] &&
              typeof rule?.["operator"] == "string" &&
              ["gte", "gt", "lt", "lte", "eq", "neq", "ends_with", "is_fractional"].includes(
                rule["operator"]
              )
            ) {
              // need to check sub conds
              puralRules.push({
                translation: rule?.["translation"],
                condition: rule?.["condition"],
                operator: rule?.["operator"],
                subconditions: rule?.["subconditions"] ?? [],
              });
            }
          }
          response.send(puralRules);
        } else {
          response.sendStatus(400);
        }
      } catch(e) {
        response.sendStatus(400);
      }
    } catch (e) {
        response.sendStatus(400);
    }
  }

  @Post("/proxy/chatgpt/genderize")
  public async genderize(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: GenderizationRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: GENDERIZE_HELP_PROMPT(body.localeCode),
          },
          {
            role: "user",
            content: body.richText,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      let puralRules: Array<{
        translation: string;
        condition: number;
      }> = [];
      try {
        const genderRulesRaw =
          typeof promptResponse?.["choices"]?.[0]?.["message"]?.["content"] !=
          "string"
            ? (promptResponse?.["choices"]?.[0]?.["message"]?.[
                "content"
              ] as Array<unknown>)
            : (JSON.parse(
                promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ??
                  "[]"
              ) as Array<unknown>);
        if (Array.isArray(genderRulesRaw)) {
          for (let rule of genderRulesRaw) {
            if (
              rule?.["translation"] &&
              typeof rule?.["translation"] == "string" &&
              ["male", "female", "neutral"].includes(
                rule?.["condition"]
              )
            ) {
              // need to check sub conds
              puralRules.push({
                translation: rule?.["translation"],
                condition: rule?.["condition"],
              });
            }
          }
          response.send(puralRules);
        } else {
          response.sendStatus(400);
        }
      } catch(e) {
        response.sendStatus(400);
      }
    } catch (e) {
        response.sendStatus(400);
    }
  }
}