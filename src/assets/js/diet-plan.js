import { buildDietPlan } from './diet-engine';

const form = document.getElementById('diet-form');
const out = document.getElementById('diet-result');
const MEAL_LABELS = { breakfast: 'الفطور', snack_1: 'وجبة خفيفة 1', lunch: 'الغداء', snack_2: 'وجبة خفيفة 2', dinner: 'العشاء' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Ask the Claude-backed API when configured; any failure falls back to the local engine.
async function getPlan(d) {
    const url = form.dataset.apiUrl;
    if (url) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d),
                signal: AbortSignal.timeout(45000),
            });
            if (res.ok) return await res.json();
        } catch (e) { /* use local engine */ }
    }
    return buildDietPlan(d);
}

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    ['age', 'weight', 'height'].forEach((k) => (d[k] = parseFloat(d[k])));
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    out.textContent = 'جاري إعداد نظامك...';
    try {
        const r = await getPlan(d), s = r.user_summary, m = s.macros_grams;
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
    } finally {
        btn.disabled = false;
    }
});
