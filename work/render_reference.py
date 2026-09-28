import bpy, math
from mathutils import Vector
from pathlib import Path
s=bpy.context.scene
s.render.engine='CYCLES'; s.cycles.samples=128;s.cycles.use_denoising=True
s.render.resolution_x=768;s.render.resolution_y=1024;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.film_transparent=True
s.world.color=(0.5,0.5,0.5)
s.view_settings.view_transform='Standard'
mesh=next(o for o in s.objects if o.type=='MESH')
corners=[mesh.matrix_world@Vector(p) for p in mesh.bound_box]
center=sum(corners,Vector())/8
print('CENTER',list(center))
camd=bpy.data.cameras.new('ReferenceCamera'); cam=bpy.data.objects.new('ReferenceCamera',camd);s.collection.objects.link(cam);s.camera=cam;camd.type='ORTHO';camd.ortho_scale=2.5
for idx,pos in enumerate([(3,-4,4),(-3,4,4),(0,0,5)]):
 d=bpy.data.lights.new('ReferenceLight'+str(idx),'AREA');d.energy=180;d.shape='DISK';d.size=4
 o=bpy.data.objects.new(d.name,d);s.collection.objects.link(o);o.location=pos;o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
out=Path('outputs/model_reference');out.mkdir(exist_ok=True)
for name,offset,target,scale in [('front',(4,0,0),center,2.5),('back',(-4,0,0),center,2.5),('face_front',(4,0,0),Vector((0,0,1.82)),0.8),('face_threequarter',(4,-2,0),Vector((0,0,1.82)),0.8)]:
 camd.ortho_scale=scale
 cam.location=target+Vector(offset);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
 s.render.filepath=str((out/(name+'.png')).resolve());bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str((out/'Jett_reference_scene.blend').resolve()))
