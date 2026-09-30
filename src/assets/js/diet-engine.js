// Diet plan engine: Mifflin-St Jeor BMR -> TDEE -> goal adjustment -> macros -> meals.
const ACTIVITY = { "خامل": 1.2, "خفيف": 1.375, "متوسط": 1.55, "نشط جداً": 1.725 };
const SPLIT = {
  "إنقاص الوزن": { carbs: 0.4, protein: 0.3, fats: 0.3, delta: -400 },
  "الحفاظ": { carbs: 0.45, protein: 0.25, fats: 0.3, delta: 0 },
  "بناء العضلات": { carbs: 0.45, protein: 0.3, fats: 0.25, delta: 400 },
};
const MEALS = [
  ["breakfast", 0.25], ["snack_1", 0.1], ["lunch", 0.35], ["snack_2", 0.1], ["dinner", 0.2],
];
const OPTIONS = {
  breakfast: ["شوفان بالماء مع موز وحفنة لوز", "بيضتان مسلوقتان مع خبز أسمر وخيار"],
  snack_1: ["تفاحة مع ملعقة زبدة فول سوداني", "حفنة مكسرات غير مملحة"],
  lunch: ["صدر دجاج مشوي مع أرز بني وسلطة خضار", "سمك مشوي مع بطاطا حلوة وبروكلي"],
  snack_2: ["زبادي يوناني مع توت", "حمص مع شرائح جزر"],
  dinner: ["سلطة تونة مع زيت زيتون وخبز أسمر", "عدس مطبوخ مع خضار مشكلة"],
};
const DAIRY = /ألبان|لاكتوز|dairy/i, VEG = /نباتي|vegan|vegetarian/i;
const DIABETES = /سكري|diabetes/i, PRESSURE = /ضغط|hypertension/i;

export function buildDietPlan({ age, gender, weight, height, activity_level, goal, allergies_and_diet = "", health_conditions = "" }) {
  const factor = ACTIVITY[activity_level], split = SPLIT[goal];
  if (!factor || !split || !(age > 0 && weight > 0 && height > 0)) throw new Error("بيانات غير صالحة");
  const male = /ذكر|male/i.test(gender) && !/أنثى|female/i.test(gender);
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (male ? 5 : -161));
  const target = Math.max(Math.round(bmr * factor + split.delta), male ? 1500 : 1200);
  const options = JSON.parse(JSON.stringify(OPTIONS));
  if (DAIRY.test(allergies_and_diet)) options.snack_2[0] = "فواكه طازجة مع مكسرات";
  if (VEG.test(allergies_and_diet)) {
    options.breakfast[1] = "توست أسمر مع أفوكادو وحمص";
    options.lunch = ["عدس وحمص مع أرز بني وسلطة", "شاكشوكة خضار مع كينوا"];
    options.dinner[0] = "سلطة حمص وكينوا بزيت الزيتون";
  }
  const tips = ["اشرب الماء على مدار اليوم ولا تنتظر العطش.", "اعتمد على الأطعمة الكاملة وقلل المصنّعة.", "نم 7-8 ساعات يومياً."];
  if (DIABETES.test(health_conditions)) tips.push("تجنب السكريات البسيطة وفضّل الأطعمة ذات المؤشر الجلايسيمي المنخفض، وراقب سكر الدم.");
  if (PRESSURE.test(health_conditions)) tips.push("قلل الملح والأطعمة المالحة المصنّعة.");
  const diet_plan = {};
  for (const [k, p] of MEALS) diet_plan[k] = { calories: Math.round(target * p), options: options[k] };
  return {
    user_summary: {
      bmr, target_calories: target,
      macros_grams: {
        protein: Math.round((target * split.protein) / 4),
        carbs: Math.round((target * split.carbs) / 4),
        fats: Math.round((target * split.fats) / 9),
      },
    },
    water_intake_liters: Math.round((weight * 0.035 + (factor >= 1.55 ? 0.5 : 0)) * 10) / 10,
    diet_plan, nutrition_tips: tips,
    medical_disclaimer: "هذا النظام إرشادي ولا يغني عن استشارة طبيب أو أخصائي تغذية، خاصة عند وجود حالة صحية.",
  };
}
