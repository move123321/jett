import bpy,json,os
from pathlib import Path
data={'blender':bpy.app.version_string,'objects':[],'images':[],'scenes':[]}
for o in bpy.data.objects:
 d={'name':o.name,'type':o.type,'hidden':o.hide_render,'location':list(o.location),'dimensions':list(o.dimensions)}
 if o.type=='MESH':d.update(vertices=len(o.data.vertices),materials=[m.name if m else None for m in o.data.materials],shape_keys=list(o.data.shape_keys.key_blocks.keys()) if o.data.shape_keys else [],modifiers=[{'name':m.name,'type':m.type} for m in o.modifiers])
 if o.type=='ARMATURE':d['bones']=[b.name for b in o.data.bones]
 data['objects'].append(d)
for i in bpy.data.images:
 p=bpy.path.abspath(i.filepath)
 data['images'].append({'name':i.name,'path':p,'packed':bool(i.packed_file),'exists':os.path.isfile(p),'size':list(i.size)})
for s in bpy.data.scenes:data['scenes'].append({'name':s.name,'camera':s.camera.name if s.camera else None,'engine':s.render.engine})
Path('outputs/blender_inspection.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('INSPECTION',json.dumps(data,ensure_ascii=False))
