import os
import re

src_dir = r"d:\VKB_Projects\LOMAR\repo\src"
hex_pattern = re.compile(r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b')

colors = set()

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                matches = hex_pattern.findall(content)
                for match in matches:
                    colors.add('#' + match.upper())

print("Unique colors found:")
for c in sorted(colors):
    print(c)
