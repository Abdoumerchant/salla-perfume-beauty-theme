import { buildDietPlan } from './diet-engine';

const form = document.getElementById('diet-form');
const out = document.getElementById('diet-result');
const MEAL_LABELS = { breakfast: 'الفطور', snack_1: 'وجبة خفيفة 1', lunch: 'الغداء', snack_2: 'وجبة خفيفة 2', dinner: 'العشاء' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    ['age', 'weight', 'height'].forEach((k) => (d[k] = parseFloat(d[k])));
    try {
        const r = buildDietPlan(d), s = r.user_summary, m = s.macros_grams;
        out.innerHTML = `
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-center">
            <div class="p-4 bg-gray-50 rounded"><b>${s.bmr}</b><br>BMR</div>
            <div class="p-4 bg-gray-50 rounded"><b>${s.target_calories}</b><br>سعرة/يوم</div>
            <div class="p-4 bg-gray-50 rounded"><b>${m.protein}/${m.carbs}/${m.fats}</b><br>بروتين/كارب/دهون (غ)</div>
            <div class="p-4 bg-gray-50 rounded"><b>${r.water_intake_liters}</b><br>لتر ماء</div>
          </div>
          ${Object.entries(r.diet_plan).map(([k, v]) => `
            <div class="mb-4"><h3 class="font-bold">${MEAL_LABELS[k]} — ${v.calories} سعرة</h3>
            <ul class="list-disc mr-6">${v.options.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>`).join('')}
          <h3 class="font-bold mt-6">نصائح</h3>
          <ul class="list-disc mr-6">${r.nutrition_tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <p class="text-sm text-gray-500 mt-6">${esc(r.medical_disclaimer)}</p>`;
    } catch (err) {
        out.textContent = err.message;
    }
});
