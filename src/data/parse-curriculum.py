import re
import json

def parse_components_to_json():
    with open('../../../components.md', 'r') as f:
        lines = f.readlines()
    
    topics = []
    current_hierarchy = {}
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Prerequisites:'):
            continue
            
        # Match the numbering pattern
        match = re.match(r'^([\d\.]+)\.\s+(.+)$', line)
        if match:
            numbering = match.group(1)
            name = match.group(2)
            
            # Get next line for prerequisites
            idx = lines.index(line + '\n')
            prereq_line = lines[idx + 1].strip() if idx + 1 < len(lines) else ""
            prerequisites = []
            
            if prereq_line.startswith('Prerequisites:'):
                prereq_text = prereq_line.replace('Prerequisites:', '').strip()
                if prereq_text != 'None':
                    prerequisites = [p.strip() for p in prereq_text.split(',')]
            
            # Create topic ID from name (kebab-case)
            topic_id = re.sub(r'\s+', '-', name)
            
            # Determine level from numbering
            level = len(numbering.split('.'))
            
            # Create folder path like the existing structure
            folder_parts = numbering.split('.')
            folder_name = '-'.join([f"{int(part):02d}" if i == 0 else part for i, part in enumerate(folder_parts)])
            folder_name += '-' + topic_id
            
            topic = {
                'id': topic_id,
                'name': name,
                'numbering': numbering,
                'level': level,
                'prerequisites': prerequisites,
                'folderPath': f"plans/{folder_name}",
                'lessons': [
                    {'id': f"{topic_id}-part-1", 'number': 1, 'completed': False},
                    {'id': f"{topic_id}-part-2", 'number': 2, 'completed': False},
                    {'id': f"{topic_id}-part-3", 'number': 3, 'completed': False}
                ]
            }
            
            topics.append(topic)
            current_hierarchy[numbering] = topic_id
    
    curriculum = {
        'topics': topics,
        'version': '1.0'
    }
    
    with open('curriculum.json', 'w') as f:
        json.dump(curriculum, f, indent=2)
    
    print(f"Generated curriculum.json with {len(topics)} topics")

if __name__ == "__main__":
    parse_components_to_json()