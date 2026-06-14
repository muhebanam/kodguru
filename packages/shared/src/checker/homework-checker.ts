export type CheckResult = {
  passed: boolean;
  messageBn: string;
  details?: Record<string, unknown>;
};

type Rule = Record<string, any>;

export function checkHomeworkSubmission(input: string, rule: Rule): CheckResult {
  const source = (input || '').toLowerCase();
  const type = rule?.type;

  if (!type) return { passed: true, messageBn: 'এই কাজের জন্য automatic checker নেই। শিক্ষক review করবেন।' };

  if (type === 'html_contains') {
    const tags: string[] = rule.tags || [];
    const missing = tags.filter((tag) => !new RegExp(`<\\s*${tag}(\\s|>|/)`, 'i').test(input));
    return missing.length === 0
      ? { passed: true, messageBn: 'দারুণ! দরকারি HTML tag পাওয়া গেছে।' }
      : { passed: false, messageBn: `আরও একটু ঠিক করি। এই tagগুলো পাওয়া যায়নি: ${missing.join(', ')}`, details: { missing } };
  }

  if (type === 'css_contains') {
    const properties: string[] = rule.properties || [];
    const selectors: string[] = rule.selectors || [];
    const missingProperties = properties.filter((p) => !source.includes(p.toLowerCase()));
    const missingSelectors = selectors.filter((s) => !source.includes(s.toLowerCase()));
    const passed = missingProperties.length === 0 && missingSelectors.length === 0;
    return passed
      ? { passed: true, messageBn: 'ভালো হয়েছে! দরকারি CSS property/selector পাওয়া গেছে।' }
      : { passed: false, messageBn: 'কিছু CSS অংশ এখনো নেই। missing অংশগুলো দেখে আবার চেষ্টা করুন।', details: { missingProperties, missingSelectors } };
  }

  if (type === 'js_contains') {
    const keywords: string[] = rule.keywords || [];
    const missing = keywords.filter((k) => !source.includes(k.toLowerCase()));
    return missing.length === 0
      ? { passed: true, messageBn: 'JavaScript practice ঠিক পথে আছে।' }
      : { passed: false, messageBn: `এই keyword/logic গুলো পাওয়া যায়নি: ${missing.join(', ')}`, details: { missing } };
  }

  if (type === 'text_contains') {
    const keywords: string[] = rule.keywords || [];
    const missing = keywords.filter((k) => !source.includes(String(k).toLowerCase()));
    return missing.length === 0
      ? { passed: true, messageBn: 'লেখায় দরকারি শব্দ পাওয়া গেছে।' }
      : { passed: false, messageBn: 'আরও স্পষ্ট করে লিখুন। কিছু দরকারি শব্দ নেই।', details: { missing } };
  }

  if (type === 'text_min_length') {
    const minLength = Number(rule.minLength || 50);
    return input.trim().length >= minLength
      ? { passed: true, messageBn: 'ভালো! উত্তর যথেষ্ট বড় হয়েছে।' }
      : { passed: false, messageBn: `আরও একটু লিখুন। কমপক্ষে ${minLength} অক্ষর দরকার।` };
  }

  if (type === 'checklist') {
    return { passed: true, messageBn: 'Checklist-based কাজ। student নিজে tick করবে, পরে teacher/admin review করতে পারবে।', details: { items: rule.items || [] } };
  }

  return { passed: false, messageBn: `অজানা checker type: ${type}` };
}
