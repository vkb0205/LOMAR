import os
import re
from pathlib import Path

src_dir = Path(__file__).resolve().parents[1] / "src"

# Mapping strategy from implementation plan
color_map = {
    # Text/Headline
    r'#1D3557': '#1B2C40',
    # Accent (Medium Blues)
    r'#5D7B9A': '#6B92B4',
    r'#457B9D': '#3A5E7F',
    # Highlight (Pink/Accent)
    r'#F494A2': '#F2BFC8',
    r'#E57373': '#F2BFC8',
    r'#E57888': '#F2BFC8',
    # Backgrounds (Neutral Light)
    r'#FEF6F7': '#FAF6EE',
    r'#FFF5F5': '#FAF6EE',
    r'#FCEADE': '#FAF6EE',
    r'#FFF9FA': '#FAF6EE',
    r'#FFFBFB': '#FAF6EE',
    r'#FFFDFD': '#FAF6EE'
}

# Compile regex patterns
compiled_patterns = [(re.compile(pattern, re.IGNORECASE), replacement) for pattern, replacement in color_map.items()]

files_changed = 0

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for pattern, replacement in compiled_patterns:
                content = pattern.sub(replacement, content)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated: {filepath}")
                files_changed += 1

print(f"Color replacement complete. {files_changed} files updated.")
