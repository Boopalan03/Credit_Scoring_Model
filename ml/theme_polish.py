import os

PAGES_DIR = r"c:\Documents\ClaySys\client\src\pages"
files_to_polish = ["Dashboard.jsx", "ApplicationForm.jsx", "PredictionResult.jsx", "AdminDashboard.jsx", "Home.jsx"]

replacements = [
    # Clean Card background/border overrides so the glass-panel class in Card.jsx can work dynamically
    ('className="bg-slate-900 border-slate-800 shadow-2xl p-8 text-center max-w-xl mx-auto space-y-6"', 'className="shadow-2xl p-8 text-center max-w-xl mx-auto space-y-6"'),
    ('className="bg-slate-900 border-slate-800 shadow-2xl p-5"', 'className="shadow-2xl p-5"'),
    ('className="bg-slate-900 border-slate-800 shadow-2xl p-6 print:border-gray-300"', 'className="shadow-2xl p-6 print:border-gray-300"'),
    ('className="bg-slate-900 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6 text-center print:border-gray-300"', 'className="shadow-2xl flex flex-col items-center justify-center p-6 text-center print:border-gray-300"'),
    ('className="bg-slate-900 border-slate-850 p-4 rounded-2xl flex items-center gap-3.5"', 'className="p-4 rounded-2xl flex items-center gap-3.5"'),
    ('className="bg-slate-900 border-slate-800 p-4 flex items-center gap-3.5"', 'className="p-4 flex items-center gap-3.5"'),
    ('className="bg-slate-900 border-slate-800 p-5"', 'className="shadow-xl p-5"'),
    ('className="bg-slate-900 border-slate-800 shadow-2xl"', 'className="shadow-2xl"'),
    ('className="bg-slate-900 border-slate-800 bg-gradient-to-r from-slate-900 to-red-950/10 p-5"', 'className="bg-gradient-to-r from-slate-950/5 to-red-950/5 dark:from-slate-900 dark:to-red-950/10 shadow-xl p-5"'),
    ('className="bg-slate-900 border-slate-800 p-8 text-center max-w-xl mx-auto space-y-6"', 'className="p-8 text-center max-w-xl mx-auto space-y-6"'),
    
    # Adapt main container text colors
    ('text-slate-100 pb-12', 'text-slate-800 dark:text-slate-100 pb-12'),
    ('text-slate-100', 'text-slate-800 dark:text-slate-100'),
    
    # Adapt headers
    ('text-white', 'text-slate-900 dark:text-white'),
    ('text-slate-900 dark:text-white', 'text-slate-900 dark:text-white'), # avoid double matches
    
    # Adapt secondary texts
    ('text-slate-400', 'text-slate-500 dark:text-slate-400'),
    ('text-slate-300', 'text-slate-700 dark:text-slate-300'),
    
    # Adapt inner panel backgrounds and borders
    ('bg-slate-950/40 border border-slate-850', 'bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80'),
    ('bg-slate-950/60 border border-slate-800/80', 'bg-slate-100/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80'),
    ('bg-slate-950 border border-slate-800', 'bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800'),
    ('bg-slate-950/30', 'bg-slate-100/30 dark:bg-slate-950/30'),
    ('bg-slate-950/40', 'bg-slate-100/40 dark:bg-slate-950/40'),
    ('bg-slate-950', 'bg-slate-100/80 dark:bg-slate-950'),
    ('bg-slate-900/40', 'bg-slate-100/30 dark:bg-slate-900/40'),
    ('bg-slate-900/20', 'bg-slate-100/20 dark:bg-slate-900/20'),
    ('bg-slate-900/30', 'bg-slate-100/30 dark:bg-slate-900/30'),
    ('bg-slate-850', 'bg-slate-100 dark:bg-slate-850'),
    ('bg-slate-800/80 border border-slate-700/50', 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50'),
    ('bg-slate-800/60', 'bg-slate-200/60 dark:bg-slate-800/60'),
    
    # Adapt border lines
    ('border-slate-800/80', 'border-slate-200 dark:border-slate-800/80'),
    ('border-slate-800', 'border-slate-200 dark:border-slate-800'),
    ('border-slate-850', 'border-slate-200 dark:border-slate-800'),
    ('border-slate-900', 'border-slate-200 dark:border-slate-900'),
    
    # Details table body rows backgrounds
    ('divide-slate-900', 'divide-slate-200 dark:divide-slate-900'),
    ('hover:bg-slate-950/20', 'hover:bg-slate-100/40 dark:hover:bg-slate-950/20'),
    
    # Chart container styling
    ('stroke="#1E293B"', 'stroke="var(--border-default)"'),
    ('contentStyle={{ backgroundColor: \'#0F172A\', borderColor: \'#1E293B\', borderRadius: \'12px\', color: \'#FFF\', fontSize: \'11px\' }}',
     'contentStyle={{ backgroundColor: \'var(--bg-root)\', borderColor: \'var(--border-default)\', borderRadius: \'12px\', color: \'var(--text-primary)\', fontSize: \'11px\' }}'),
]

print("Starting theme polish on React pages...")

for filename in files_to_polish:
    filepath = os.path.join(PAGES_DIR, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename} (does not exist)")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    for target, replacement in replacements:
        content = content.replace(target, replacement)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Polished: {filename}")
    else:
        print(f"No changes needed: {filename}")

print("Theme polish complete!")
