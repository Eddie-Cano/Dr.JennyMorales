"""Build a portable presentation; do not use as the production entrypoint."""
from pathlib import Path
import base64,mimetypes,re
root=Path(__file__).resolve().parent
html=(root/'index.html').read_text()
for file in ['refinement.css','reception.css']:
 html=html.replace('<link rel="stylesheet" href="./assets/'+file+'">','<style>'+(root/'assets'/file).read_text()+'</style>')
for file in ['demo.js','lead-flow.js','reception.js']:
 html=html.replace('<script src="./assets/'+file+'"></script>','<script>'+(root/'assets'/file).read_text()+'</script>')
def embed(match):
 path=root/match.group(1)
 return 'src="data:'+mimetypes.guess_type(path)[0]+';base64,'+base64.b64encode(path.read_bytes()).decode()+'"'
html=re.sub(r'src="\./([^\"]+\.(?:png|webp))"',embed,html)
# Credential remains a link to the unchanged public repository asset.
html=html.replace('./15656534-C1.pdf','https://github.com/Eddie-Cano/Dr.JennyMorales/blob/main/15656534-C1.pdf')
(root/'Demo_Jenny_Morales.html').write_text(html)
print('Portable preview generated')
