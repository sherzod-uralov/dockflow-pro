import mammoth from "mammoth";

export interface ExtractedTag {
  name: string;
  type: string;
}

export interface ExtractedTags {
  [key: string]: string;
}

/**
 * Extract placeholders from Word document content
 * Looks for patterns like {name}, {employeeName}, {salary}, etc.
 */
export const extractTagsFromText = (text: string): ExtractedTags => {
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const tags: ExtractedTags = {};
  let match;

  while ((match = regex.exec(text)) !== null) {
    const tagName = match[1];
    // Default all types to "string"
    if (!tags[tagName]) {
      tags[tagName] = "string";
    }
  }

  return tags;
};

/**
 * Parse a Word file and extract placeholders
 * @param file - The Word file to parse
 * @returns Promise with extracted tags object
 */
export const parseWordFile = async (file: File): Promise<ExtractedTags> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        const tags = extractTagsFromText(text);
        resolve(tags);
      } catch (error) {
        reject(new Error("Word faylini o'qishda xatolik yuz berdi"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Faylni o'qishda xatolik yuz berdi"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Convert extracted tags to array format for display
 */
export const tagsToArray = (tags: ExtractedTags): ExtractedTag[] => {
  return Object.entries(tags).map(([name, type]) => ({
    name,
    type,
  }));
};

/**
 * Convert array of tags back to object format
 */
export const arrayToTags = (tagsArray: ExtractedTag[]): ExtractedTags => {
  return tagsArray.reduce((acc, tag) => {
    acc[tag.name] = tag.type;
    return acc;
  }, {} as ExtractedTags);
};
