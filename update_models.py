import os

backend_dir = r"d:\Hexaware Training\Gen Ai\Project\AI-Powered_Smart_Citizen_Service_Assistant\backend"
target = "gemini-2.5-flash"
replacement = "gemini-1.5-flash"

modified_files = []

for root, _, files in os.walk(backend_dir):
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if target in content:
                new_content = content.replace(target, replacement)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                modified_files.append(filepath)

print("Modified files:")
for f in modified_files:
    print("-", f)
