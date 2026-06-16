import { DisplayCondition, MaterialItem } from '@/types';

export const evaluateCondition = (
  cond: DisplayCondition,
  answers: Record<string, string | string[]>
): boolean => {
  const ans = answers[cond.questionId];

  if (cond.textNotEmpty) {
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return typeof ans === 'string' && ans.trim().length > 0;
  }

  const ansText: string = Array.isArray(ans) ? ans.join('、') : (ans || '');
  const ansArray: string[] = Array.isArray(ans) ? ans : (ans ? [ans] : []);

  if (cond.anyOf) {
    const match = cond.anyOf.some(opt => ansArray.includes(opt) || ansText.includes(opt));
    if (!match) return false;
  }

  if (cond.noneOf) {
    const conflict = cond.noneOf.some(opt => ansArray.includes(opt) || ansText.includes(opt));
    if (conflict) return false;
  }

  return true;
};

export const checkMaterialDisplay = (
  material: MaterialItem,
  answers: Record<string, string | string[]>
): boolean => {
  if (!material.conditions || material.conditions.length === 0) return true;
  return material.conditions.every(cond => evaluateCondition(cond, answers));
};

export const getShareholderCount = (answers: Record<string, string | string[]>): number => {
  const q7 = answers['q7'] as string;
  const q3 = answers['q3'] as string;
  if (q3?.includes('独资') || q7 === '仅1人（独资）') return 1;
  if (q7 === '2人') return 2;
  if (q7 === '3-5人') return 4;
  if (q7 === '5人以上') return 6;
  return 1;
};

export const expandDynamicMaterials = (
  materials: MaterialItem[],
  answers: Record<string, string | string[]>
): MaterialItem[] => {
  const result: MaterialItem[] = [];
  materials.forEach(m => {
    if (checkMaterialDisplay(m, answers)) {
      if (m.dynamicSuffix === '_shareholder_count') {
        const count = getShareholderCount(answers);
        for (let i = 1; i <= count; i++) {
          result.push({
            ...m,
            id: `${m.id}_${i}`,
            name: `${m.name}（股东${count > 1 ? i : ''}）`.replace('（股东）', ''),
            dynamicSuffix: undefined,
            conditions: undefined
          });
        }
      } else {
        result.push(m);
      }
    }
  });
  return result;
};
